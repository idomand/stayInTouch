import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { getOwnedContact } from "@/lib/db/queries/guards";
import { contacts, notes, talkEvents } from "@/lib/db/schema";
import {
  type ErrorMessage,
  isUniqueViolation,
  isValidTimeZone,
  normalizeEmail,
  validateFields,
  validateNoteBody,
} from "@/lib/actions/validation";

/**
 * Contact writes that take the caller's uid as an argument. Two entry points
 * supply it: the Server Actions in lib/actions/contacts.ts (from the session
 * cookie) and the MCP tools (from an API token). So nothing here may call
 * requireUser() or getServerUser(): an MCP request has no cookie, and the
 * redirect in requireUser() would break a route handler. Errors are message
 * keys, not text; each entry point turns them into its own language.
 */

const NOT_FOUND: ErrorMessage = { key: "contactNotFound" };
const NAME_TAKEN: ErrorMessage = { key: "nameTaken" };

type CoreError = { ok: false; error: ErrorMessage };

export type AddContactInput = {
  name: string;
  cadenceDays: number;
  friendEmail?: string | null;
  /** Optional first note. */
  note?: string;
  /** "Last time we spoke", epoch ms — seeds the first talk event. */
  talkedAtMs?: number;
};

export async function addContactForUser(
  uid: string,
  input: AddContactInput,
): Promise<{ ok: true; contactId: string } | CoreError> {
  const invalid =
    validateFields(input) ?? validateNoteBody(input.note, { optional: true });
  if (invalid) {
    return { ok: false, error: invalid };
  }

  try {
    const contactId = await db.transaction(async (tx) => {
      const [contact] = await tx
        .insert(contacts)
        .values({
          ownerId: uid,
          name: input.name.trim(),
          cadenceDays: input.cadenceDays,
          friendEmail: normalizeEmail(input.friendEmail),
        })
        .returning({ id: contacts.id });

      if (input.talkedAtMs != null) {
        await tx.insert(talkEvents).values({
          contactId: contact.id,
          createdBy: uid,
          talkedAt: new Date(input.talkedAtMs),
        });
      }
      const note = input.note?.trim();
      if (note) {
        await tx.insert(notes).values({ contactId: contact.id, body: note });
      }
      return contact.id;
    });
    return { ok: true, contactId };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: NAME_TAKEN };
    }
    throw error;
  }
}

/**
 * Record a talk now, unless the contact already has a talk today in the
 * caller's time zone — a second mark on the same day is a no-op
 * (`inserted: false`). On a linked contact a talk the friend marked today
 * counts too. Two tabs clicking at the same instant could still both insert;
 * not worth a lock.
 */
export async function markAsTalkedForUser(
  uid: string,
  contactId: string,
  timeZone: string,
): Promise<
  { ok: true; inserted: boolean; sharedWithLinkedContact: boolean } | CoreError
> {
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return { ok: false, error: NOT_FOUND };
  }
  // Only a tampered request sends an unknown zone; UTC never blocks a real user.
  const zone = isValidTimeZone(timeZone) ? timeZone : "UTC";
  // Start of the caller's local day as a timestamptz, so the range filter uses
  // the (contact_id, talked_at DESC) index.
  const talkedToday = await db.execute(sql`
    SELECT 1 FROM talk_events
    WHERE contact_id = ${contactId}
      AND talked_at >= date_trunc('day', now() AT TIME ZONE ${zone}::text) AT TIME ZONE ${zone}::text
    LIMIT 1
  `);
  if (talkedToday.rows.length > 0) {
    return { ok: true, inserted: false, sharedWithLinkedContact: false };
  }
  const sharedWithLinkedContact = await insertSharedTalkEvent(
    uid,
    contactId,
    new Date(),
  );
  return { ok: true, inserted: true, sharedWithLinkedContact };
}

/** The id of the contact linked to this one, as a subquery (zero or one row). */
export function linkedContactIds(contactId: string) {
  return sql`
    SELECT CASE WHEN l.contact_a_id = ${contactId}
                THEN l.contact_b_id ELSE l.contact_a_id END
    FROM contact_links l
    WHERE l.contact_a_id = ${contactId} OR l.contact_b_id = ${contactId}
  `;
}

/**
 * Insert one talk on the caller's contact and, when it is linked, the same talk
 * on the friend's contact. Both rows get one shared_id so a delete can find the
 * pair. The caller must have checked ownership of contactId. Returns true when
 * the friend's row was written too.
 */
export async function insertSharedTalkEvent(
  uid: string,
  contactId: string,
  talkedAt: Date,
): Promise<boolean> {
  const sharedId = crypto.randomUUID();
  return db.transaction(async (tx) => {
    await tx
      .insert(talkEvents)
      .values({ contactId, createdBy: uid, talkedAt, sharedId });
    // The same talk on the linked contact, owned by the other user. The link
    // row is the only permission for this cross-user write. Zero rows when the
    // contact is not linked, so no `if`.
    const linked = await tx.execute(sql`
      INSERT INTO talk_events (contact_id, created_by, talked_at, shared_id)
      SELECT linked.id, ${uid}, ${talkedAt}, ${sharedId}
      FROM (${linkedContactIds(contactId)}) AS linked(id)
    `);
    return (linked.rowCount ?? 0) > 0;
  });
}
