import "server-only";
import type { McpServer, ServerContext } from "@modelcontextprotocol/server";
import { createTranslator } from "next-intl";
import { z } from "zod";
import en from "@/i18n/en.json";
import { addContactForUser, markAsTalkedForUser } from "@/lib/contacts/core";
import { getOwnedContactByName } from "@/lib/db/queries/guards";
import { getContactsForUser } from "@/lib/db/queries/contacts";
import { type ErrorMessage, isValidTimeZone } from "@/lib/actions/validation";
import { maxCadenceDays, maxNameLength } from "@/lib/ConstantsFile";

/**
 * The MCP tools. Every tool takes the caller's uid from the verified API token
 * (ctx.http.authInfo, set by withMcpAuth in app/api/mcp/route.ts), never from
 * its input, and passes it to the uid-based core and queries. So an agent can
 * only ever reach its own user's contacts. Replies are English: the agent
 * talks to the user in their language.
 */

const FIND_LIMIT = 50;
const SUGGESTION_LIMIT = 5;

const t = createTranslator({ locale: "en", messages: en });

function errorText({ key, values }: ErrorMessage): string {
  return t(`errors.${key}`, values);
}

function textResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

/** The uid behind this request. withMcpAuth guarantees it; fail closed if not. */
function uidOf(ctx: ServerContext): string {
  const uid = ctx.http?.authInfo?.extra?.uid;
  if (typeof uid !== "string" || !uid) {
    throw new Error("MCP tool called without an authenticated uid.");
  }
  return uid;
}

/** Lower case without accents, so "jose" finds "José". */
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Names of the user's contacts that share a word with `name`. */
async function similarNames(uid: string, name: string): Promise<string[]> {
  const words = normalize(name)
    .split(/\s+/)
    .filter((word) => word.length >= 2);
  if (words.length === 0) {
    return [];
  }
  const contacts = await getContactsForUser(uid);
  return contacts
    .filter((contact) => {
      const candidate = normalize(contact.name);
      return words.some((word) => candidate.includes(word));
    })
    .slice(0, SUGGESTION_LIMIT)
    .map((contact) => contact.name);
}

/** "YYYY-MM-DD" of the current day in `zone`. */
function todayInZone(zone: string): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(
    new Date(),
  );
}

/** Milliseconds `zone` is ahead of UTC at the instant `ms`. */
function zoneOffsetMs(ms: number, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms));
  const part = (type: string) =>
    Number(parts.find((entry) => entry.type === type)?.value);
  const wallClockAsUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return wallClockAsUtc - (ms - (ms % 1000));
}

/**
 * The moment to store for a talk given as a day, matching the history dialog:
 * today means now (so it is not in the future), an earlier day means local
 * noon in `zone`, so the day shown does not shift for the user.
 */
function talkedAtMsForDay(isoDate: string, zone: string): number {
  if (isoDate === todayInZone(zone)) {
    return Date.now();
  }
  const [year, month, day] = isoDate.split("-").map(Number);
  const noonAsUtc = Date.UTC(year, month - 1, day, 12);
  return noonAsUtc - zoneOffsetMs(noonAsUtc, zone);
}

const timeZoneSchema = z
  .string()
  .optional()
  .describe(
    "The user's IANA time zone, e.g. Europe/Berlin, if known. Decides what 'today' means. Defaults to UTC.",
  );

export function registerTools(server: McpServer) {
  server.registerTool(
    "find_contacts",
    {
      title: "Find contacts",
      description:
        "List the user's contacts (friends they want to keep in touch with), most overdue first. " +
        "Optionally filter by part of a name. Use it to answer questions like 'who should I call?' " +
        "or to check the exact spelling of a name before calling mark_as_talked.",
      inputSchema: z.object({
        query: z
          .string()
          .max(maxNameLength)
          .optional()
          .describe(
            "Part of a name, case- and accent-insensitive. Omit to list all.",
          ),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query }, ctx) => {
      const uid = uidOf(ctx);
      const needle = normalize(query ?? "");
      const contacts = (await getContactsForUser(uid))
        .filter((contact) => normalize(contact.name).includes(needle))
        .slice(0, FIND_LIMIT)
        // No friendEmail: a third person's address the agent does not need.
        .map((contact) => ({
          name: contact.name,
          cadenceDays: contact.cadenceDays,
          status:
            contact.daysUntilNextTalk == null
              ? "never_talked"
              : contact.daysUntilNextTalk > 0
                ? "ok"
                : "overdue",
          daysSinceLastTalk:
            contact.daysSinceLastTalk == null
              ? null
              : Math.floor(contact.daysSinceLastTalk),
          daysUntilNextTalk:
            contact.daysUntilNextTalk == null
              ? null
              : Math.ceil(contact.daysUntilNextTalk),
          linkedWithFriend: contact.isLinked,
        }));
      if (contacts.length === 0) {
        return textResult(
          query
            ? `No contact name contains "${query}".`
            : "The user has no contacts yet.",
        );
      }
      return textResult(JSON.stringify(contacts, null, 2));
    },
  );

  server.registerTool(
    "mark_as_talked",
    {
      title: "Mark as talked",
      description:
        "Record that the user talked to one of their contacts today. The name must match a contact " +
        "exactly (case is ignored). If it does not, nothing is recorded and similar names are returned: " +
        "ask the user which one they meant, then call again with that exact name. " +
        "Marking the same contact twice on one day records only one talk.",
      inputSchema: z.object({
        name: z.string().min(1).max(maxNameLength),
        timeZone: timeZoneSchema,
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ name, timeZone }, ctx) => {
      const uid = uidOf(ctx);
      const contact = await getOwnedContactByName(uid, name);
      if (!contact) {
        const suggestions = await similarNames(uid, name);
        return textResult(
          suggestions.length > 0
            ? `No contact is named exactly "${name}". Nothing was recorded. Similar names: ${suggestions.join(", ")}. Ask the user which one they meant.`
            : `No contact is named "${name}". Nothing was recorded. The user can add them with add_contact.`,
          true,
        );
      }
      const result = await markAsTalkedForUser(
        uid,
        contact.id,
        timeZone ?? "UTC",
      );
      if (!result.ok) {
        return textResult(errorText(result.error), true);
      }
      if (!result.inserted) {
        return textResult(
          `A talk with ${contact.name} is already recorded for today. Nothing new was added.`,
        );
      }
      return textResult(
        result.sharedWithLinkedContact
          ? `Recorded a talk with ${contact.name} today. It was also shared with ${contact.name}'s linked account.`
          : `Recorded a talk with ${contact.name} today.`,
      );
    },
  );

  server.registerTool(
    "add_contact",
    {
      title: "Add contact",
      description:
        "Add a new contact the user wants to keep in touch with. Ask the user for anything you do " +
        "not know: always ask how often they want to talk (cadenceDays) and never guess it. " +
        "The email and last talk date are optional; only pass them if the user gave them.",
      inputSchema: z.object({
        name: z.string().min(1).max(maxNameLength),
        cadenceDays: z
          .number()
          .int()
          .min(1)
          .max(maxCadenceDays)
          .describe(
            `How often to talk, in days (1 to ${maxCadenceDays}). E.g. weekly = 7.`,
          ),
        friendEmail: z
          .email()
          .optional()
          .describe("The friend's email, only if the user gave it."),
        lastTalkedAt: z.iso
          .date()
          .optional()
          .describe(
            "The day they last talked, YYYY-MM-DD, only if the user said. Not in the future.",
          ),
        timeZone: timeZoneSchema,
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ name, cadenceDays, friendEmail, lastTalkedAt, timeZone }, ctx) => {
      const uid = uidOf(ctx);
      const zone = isValidTimeZone(timeZone) ? timeZone : "UTC";
      const result = await addContactForUser(uid, {
        name,
        cadenceDays,
        friendEmail,
        talkedAtMs:
          lastTalkedAt == null
            ? undefined
            : talkedAtMsForDay(lastTalkedAt, zone),
      });
      if (!result.ok) {
        return textResult(errorText(result.error), true);
      }
      return textResult(
        `Added ${name.trim()}, to talk to every ${cadenceDays} days.`,
      );
    },
  );
}
