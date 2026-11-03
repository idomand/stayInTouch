import type { ContactActions } from "@/lib/contacts/ContactActionsContext";
import type {
  ContactListItem,
  ContactTalkEvent,
} from "@/lib/db/queries/contacts";
import {
  type ActionResult,
  type ErrorMessage,
  normalizeEmail,
  validateFields,
  validateTalkedAt,
} from "@/lib/actions/validation";

/**
 * The `/demo` data: contacts kept in this browser's localStorage, with the
 * same rules as the real Server Actions. Nothing here reaches the server.
 */

const STORAGE_KEY = "stayInTouchDemo";
const STORAGE_VERSION = 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type DemoTalkEvent = { id: string; talkedAt: string; createdByMe: boolean };

export type DemoContact = {
  id: string;
  name: string;
  cadenceDays: number;
  friendEmail: string | null;
  isLinked: boolean;
  talkEvents: DemoTalkEvent[];
};

type StoredDemo = { version: number; contacts: DemoContact[] };

function daysAgo(days: number): string {
  return new Date(Date.now() - days * ONE_DAY_MS).toISOString();
}

function talkEvent(days: number, createdByMe = true): DemoTalkEvent {
  return { id: crypto.randomUUID(), talkedAt: daysAgo(days), createdByMe };
}

/** Dates are relative to now, so each status looks right whenever it is seeded. */
function seedContacts(names: {
  mom: string;
  bestFriend: string;
}): DemoContact[] {
  return [
    {
      id: crypto.randomUUID(),
      name: names.mom,
      cadenceDays: 7,
      friendEmail: null,
      isLinked: false,
      talkEvents: [talkEvent(12), talkEvent(19), talkEvent(26)],
    },
    {
      id: crypto.randomUUID(),
      name: names.bestFriend,
      cadenceDays: 5,
      friendEmail: null,
      isLinked: true,
      talkEvents: [talkEvent(2, false), talkEvent(7)],
    },
    {
      id: crypto.randomUUID(),
      name: "Keanu Reeves",
      cadenceDays: 365,
      friendEmail: null,
      isLinked: false,
      talkEvents: [],
    },
  ];
}

function isDemoTalkEvent(value: unknown): value is DemoTalkEvent {
  const event = value as DemoTalkEvent;
  return (
    typeof event?.id === "string" &&
    typeof event.talkedAt === "string" &&
    !Number.isNaN(Date.parse(event.talkedAt)) &&
    typeof event.createdByMe === "boolean"
  );
}

/**
 * localStorage can hold anything (hand edits, an old shape), and one bad
 * contact would crash every load. Keep in step with DemoContact.
 */
function isDemoContact(value: unknown): value is DemoContact {
  const contact = value as DemoContact;
  return (
    typeof contact?.id === "string" &&
    typeof contact.name === "string" &&
    Number.isInteger(contact.cadenceDays) &&
    (contact.friendEmail === null || typeof contact.friendEmail === "string") &&
    typeof contact.isLinked === "boolean" &&
    Array.isArray(contact.talkEvents) &&
    contact.talkEvents.every(isDemoTalkEvent)
  );
}

/** The saved demo, or a fresh seed when there is none or it cannot be read. */
export function loadDemoContacts(seedNames: {
  mom: string;
  bestFriend: string;
}): DemoContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as StoredDemo;
      if (
        stored?.version === STORAGE_VERSION &&
        Array.isArray(stored.contacts) &&
        stored.contacts.every(isDemoContact)
      ) {
        return stored.contacts;
      }
    }
  } catch (error) {
    console.error("Could not read the demo data:", error);
  }
  const contacts = seedContacts(seedNames);
  saveDemoContacts(contacts);
  return contacts;
}

export function saveDemoContacts(contacts: DemoContact[]): void {
  try {
    const stored: StoredDemo = { version: STORAGE_VERSION, contacts };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    // Blocked storage: the demo still works, it just forgets on refresh.
    console.error("Could not save the demo data:", error);
  }
}

/** Same fields and order as getContactsForUser: never-talked first, then most overdue. */
export function toListItems(contacts: DemoContact[]): ContactListItem[] {
  const now = Date.now();
  const items = contacts.map((contact): ContactListItem => {
    const lastTalkedMs = contact.talkEvents.length
      ? Math.max(
          ...contact.talkEvents.map((event) => Date.parse(event.talkedAt)),
        )
      : null;
    const daysSinceLastTalk =
      lastTalkedMs == null ? null : (now - lastTalkedMs) / ONE_DAY_MS;
    return {
      id: contact.id,
      name: contact.name,
      cadenceDays: contact.cadenceDays,
      friendEmail: contact.friendEmail,
      daysUntilNextTalk:
        daysSinceLastTalk == null
          ? null
          : contact.cadenceDays - daysSinceLastTalk,
      daysSinceLastTalk,
      talkEventCount: contact.talkEvents.length,
      isLinked: contact.isLinked,
      hasPendingRequest: false,
    };
  });
  return items.sort((a, b) => {
    if (a.daysUntilNextTalk == null) {
      return b.daysUntilNextTalk == null ? 0 : -1;
    }
    if (b.daysUntilNextTalk == null) {
      return 1;
    }
    return a.daysUntilNextTalk - b.daysUntilNextTalk;
  });
}

const NOT_FOUND: ErrorMessage = { key: "contactNotFound" };
const TALK_EVENT_NOT_FOUND: ErrorMessage = { key: "talkEventNotFound" };
const NAME_TAKEN: ErrorMessage = { key: "nameTaken" };
const NOT_LINKED: ErrorMessage = { key: "contactNotLinked" };

/**
 * ContactActions backed by the demo store. `getContacts` reads the current
 * list; `setContacts` saves it and re-renders, the demo's revalidatePath.
 */
export function createDemoActions({
  translateError,
  getContacts,
  setContacts,
}: {
  /** The text of an `errors.*` message, as actionError builds it on the server. */
  translateError: (error: ErrorMessage) => string;
  getContacts: () => DemoContact[];
  setContacts: (contacts: DemoContact[]) => void;
}): ContactActions {
  function fail(error: ErrorMessage): Extract<ActionResult, { ok: false }> {
    return { ok: false, error: translateError(error) };
  }

  function isNameTaken(name: string, exceptId?: string): boolean {
    const wanted = name.trim().toLowerCase();
    return getContacts().some(
      (contact) =>
        contact.id !== exceptId && contact.name.toLowerCase() === wanted,
    );
  }

  function findContact(contactId: string): DemoContact | undefined {
    return getContacts().find((contact) => contact.id === contactId);
  }

  function replaceContact(updated: DemoContact): void {
    setContacts(
      getContacts().map((contact) =>
        contact.id === updated.id ? updated : contact,
      ),
    );
  }

  return {
    isDemo: true,

    async addContact(input) {
      const invalid = validateFields(input);
      if (invalid) {
        return fail(invalid);
      }
      if (isNameTaken(input.name)) {
        return fail(NAME_TAKEN);
      }
      const contact: DemoContact = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        cadenceDays: input.cadenceDays,
        friendEmail: normalizeEmail(input.friendEmail),
        isLinked: false,
        talkEvents:
          input.talkedAtMs == null
            ? []
            : [
                {
                  id: crypto.randomUUID(),
                  talkedAt: new Date(input.talkedAtMs).toISOString(),
                  createdByMe: true,
                },
              ],
      };
      setContacts([...getContacts(), contact]);
      return { ok: true };
    },

    async updateContact(contactId, input) {
      const existing = findContact(contactId);
      if (!existing) {
        return fail(NOT_FOUND);
      }
      const invalid = validateFields(input);
      if (invalid) {
        return fail(invalid);
      }
      if (isNameTaken(input.name, contactId)) {
        return fail(NAME_TAKEN);
      }
      replaceContact({
        ...existing,
        name: input.name.trim(),
        cadenceDays: input.cadenceDays,
        friendEmail: normalizeEmail(input.friendEmail),
        talkEvents:
          input.talkedAtMs == null
            ? existing.talkEvents
            : [
                ...existing.talkEvents,
                {
                  id: crypto.randomUUID(),
                  talkedAt: new Date(input.talkedAtMs).toISOString(),
                  createdByMe: true,
                },
              ],
      });
      return { ok: true };
    },

    async deleteContact(contactId) {
      if (!findContact(contactId)) {
        return fail(NOT_FOUND);
      }
      setContacts(getContacts().filter((contact) => contact.id !== contactId));
      return { ok: true };
    },

    // At most one talk per local day, like markAsTalkedForUser. The browser's
    // own day is the caller's day, so the time zone argument is not needed.
    async markAsTalked(contactId) {
      const existing = findContact(contactId);
      if (!existing) {
        return fail(NOT_FOUND);
      }
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const talkedToday = existing.talkEvents.some(
        (event) => Date.parse(event.talkedAt) >= startOfToday.getTime(),
      );
      if (!talkedToday) {
        replaceContact({
          ...existing,
          talkEvents: [
            ...existing.talkEvents,
            {
              id: crypto.randomUUID(),
              talkedAt: new Date().toISOString(),
              createdByMe: true,
            },
          ],
        });
      }
      return { ok: true };
    },

    async addTalkEvent(contactId, talkedAtMs) {
      const existing = findContact(contactId);
      if (!existing) {
        return fail(NOT_FOUND);
      }
      const invalid = validateTalkedAt(talkedAtMs);
      if (invalid) {
        return fail(invalid);
      }
      replaceContact({
        ...existing,
        talkEvents: [
          ...existing.talkEvents,
          {
            id: crypto.randomUUID(),
            talkedAt: new Date(talkedAtMs).toISOString(),
            createdByMe: true,
          },
        ],
      });
      return { ok: true };
    },

    async deleteTalkEvent(contactId, eventId) {
      const existing = findContact(contactId);
      if (!existing) {
        return fail(NOT_FOUND);
      }
      if (!existing.talkEvents.some((event) => event.id === eventId)) {
        return fail(TALK_EVENT_NOT_FOUND);
      }
      replaceContact({
        ...existing,
        talkEvents: existing.talkEvents.filter((event) => event.id !== eventId),
      });
      return { ok: true };
    },

    async getTalkEvents(contactId) {
      const existing = findContact(contactId);
      if (!existing) {
        return fail(NOT_FOUND);
      }
      const events: ContactTalkEvent[] = [...existing.talkEvents].sort(
        (a, b) => Date.parse(b.talkedAt) - Date.parse(a.talkedAt),
      );
      return { ok: true, events };
    },

    async unlinkContact(contactId) {
      const existing = findContact(contactId);
      if (!existing) {
        return fail(NOT_FOUND);
      }
      if (!existing.isLinked) {
        return fail(NOT_LINKED);
      }
      replaceContact({ ...existing, isLinked: false });
      return { ok: true };
    },
  };
}
