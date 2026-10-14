"use server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOwnedContact, isUuid, requireUser } from "@/lib/db/queries/guards";
import {
  type ContactTalkEvent,
  getTalkEventsForOwnedContact,
} from "@/lib/db/queries/contacts";
import { contacts, notes, talkEvents } from "@/lib/db/schema";
import { actionError } from "@/lib/actions/actionError";
import {
  type ActionResult,
  type ErrorMessage,
  isUniqueViolation,
  isValidTimeZone,
  normalizeEmail,
  validateFields,
  validateNoteBody,
  validateTalkedAt,
} from "@/lib/actions/validation";

const NOT_FOUND: ErrorMessage = { key: "contactNotFound" };
const TALK_EVENT_NOT_FOUND: ErrorMessage = { key: "talkEventNotFound" };
// Parked with the note actions below (C1).
// const NOTE_NOT_FOUND: ErrorMessage = { key: "noteNotFound" };
const NAME_TAKEN: ErrorMessage = { key: "nameTaken" };

export type AddContactInput = {
  name: string;
  cadenceDays: number;
  friendEmail?: string | null;
  /** Optional first note. */
  note?: string;
  /** "Last time we spoke", epoch ms — seeds the first talk event. */
  talkedAtMs?: number;
};

export type UpdateContactInput = {
  name: string;
  cadenceDays: number;
  friendEmail?: string | null;
  /** Set only when the date field changed; inserts a talk event at that date. */
  talkedAtMs?: number;
};

export async function addContact(
  input: AddContactInput,
): Promise<ActionResult> {
  const uid = await requireUser();
  const invalid =
    validateFields(input) ?? validateNoteBody(input.note, { optional: true });
  if (invalid) {
    return actionError(invalid);
  }

  try {
    await db.transaction(async (tx) => {
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
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return actionError(NAME_TAKEN);
    }
    throw error;
  }

  revalidatePath("/");
  return { ok: true };
}

export async function updateContact(
  contactId: string,
  input: UpdateContactInput,
): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  const invalid = validateFields(input);
  if (invalid) {
    return actionError(invalid);
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(contacts)
        .set({
          name: input.name.trim(),
          cadenceDays: input.cadenceDays,
          friendEmail: normalizeEmail(input.friendEmail),
        })
        .where(and(eq(contacts.id, contactId), eq(contacts.ownerId, uid)));

      if (input.talkedAtMs != null) {
        await tx.insert(talkEvents).values({
          contactId,
          createdBy: uid,
          talkedAt: new Date(input.talkedAtMs),
        });
      }
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return actionError(NAME_TAKEN);
    }
    throw error;
  }

  revalidatePath("/");
  return { ok: true };
}

export async function deleteContact(contactId: string): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  await db
    .delete(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.ownerId, uid)));
  revalidatePath("/");
  return { ok: true };
}

/**
 * Record a talk now, unless the contact already has a talk today in the
 * caller's time zone — a second click on the same day is a no-op. On a linked
 * contact a talk the friend marked today counts too. Two tabs clicking at the
 * same instant could still both insert; not worth a lock.
 */
export async function markAsTalked(
  contactId: string,
  timeZone: string,
): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
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
    return { ok: true };
  }
  await insertSharedTalkEvent(uid, contactId, new Date());
  revalidatePath("/");
  return { ok: true };
}

/** Record a past talk from the history dialog, on both sides when linked. */
export async function addTalkEvent(
  contactId: string,
  talkedAtMs: number,
): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  const invalid = validateTalkedAt(talkedAtMs);
  if (invalid) {
    return actionError(invalid);
  }
  await insertSharedTalkEvent(uid, contactId, new Date(talkedAtMs));
  revalidatePath("/");
  return { ok: true };
}

/**
 * Delete a talk from a contact's history, whoever logged it. On a linked
 * contact the same talk on the friend's contact goes too (matched by
 * shared_id), but only while the link exists: the link row is the only
 * permission for a cross-user write. Rows without a shared_id (written before
 * it existed) delete on this side only.
 */
export async function deleteTalkEvent(
  contactId: string,
  eventId: string,
): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  if (!isUuid(eventId)) {
    return actionError(TALK_EVENT_NOT_FOUND);
  }
  // One statement, so both rows go or neither. `shared_id = NULL` matches
  // nothing, so a row without one deletes alone.
  const result = await db.execute(sql`
    DELETE FROM talk_events t
    WHERE (t.id = ${eventId} AND t.contact_id = ${contactId})
       OR (t.shared_id = (SELECT shared_id FROM talk_events
                          WHERE id = ${eventId} AND contact_id = ${contactId})
           AND t.contact_id IN (${linkedContactIds(contactId)}))
    RETURNING t.id
  `);
  if (result.rows.length === 0) {
    return actionError(TALK_EVENT_NOT_FOUND);
  }
  revalidatePath("/");
  return { ok: true };
}

/** The id of the contact linked to this one, as a subquery (zero or one row). */
function linkedContactIds(contactId: string) {
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
 * pair. The caller must have checked ownership of contactId.
 */
async function insertSharedTalkEvent(
  uid: string,
  contactId: string,
  talkedAt: Date,
) {
  const sharedId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx
      .insert(talkEvents)
      .values({ contactId, createdBy: uid, talkedAt, sharedId });
    // The same talk on the linked contact, owned by the other user. The link
    // row is the only permission for this cross-user write. Zero rows when the
    // contact is not linked, so no `if`.
    await tx.execute(sql`
      INSERT INTO talk_events (contact_id, created_by, talked_at, shared_id)
      SELECT linked.id, ${uid}, ${talkedAt}, ${sharedId}
      FROM (${linkedContactIds(contactId)}) AS linked(id)
    `);
  });
}

/**
 * The talk history of one contact, for its history dialog. Loaded on demand so
 * the home page does not send every contact's full history.
 */
export async function getTalkEvents(
  contactId: string,
): Promise<
  { ok: true; events: ContactTalkEvent[] } | { ok: false; error: string }
> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  const events = await getTalkEventsForOwnedContact(uid, contactId);
  return { ok: true, events };
}

// Notes are parked (C1 in specs/app-review-fixes.md): no UI reaches them.
// Restore these actions and NOTE_NOT_FOUND with the UI.
// export async function addNote(
//   contactId: string,
//   body: string,
// ): Promise<ActionResult> {
//   const uid = await requireUser();
//   const existing = await getOwnedContact(uid, contactId);
//   if (!existing) {
//     return actionError(NOT_FOUND);
//   }
//   const invalid = validateNoteBody(body);
//   if (invalid) {
//     return actionError(invalid);
//   }
//   await db.insert(notes).values({ contactId, body: body.trim() });
//   revalidatePath("/");
//   return { ok: true };
// }
//
// export async function updateNote(
//   contactId: string,
//   noteId: string,
//   body: string,
// ): Promise<ActionResult> {
//   const uid = await requireUser();
//   const existing = await getOwnedContact(uid, contactId);
//   if (!existing) {
//     return actionError(NOT_FOUND);
//   }
//   if (!isUuid(noteId)) {
//     return actionError(NOTE_NOT_FOUND);
//   }
//   const invalid = validateNoteBody(body);
//   if (invalid) {
//     return actionError(invalid);
//   }
//   const updated = await db
//     .update(notes)
//     .set({ body: body.trim() })
//     .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)))
//     .returning({ id: notes.id });
//   if (updated.length === 0) {
//     return actionError(NOTE_NOT_FOUND);
//   }
//   revalidatePath("/");
//   return { ok: true };
// }
//
// export async function deleteNote(
//   contactId: string,
//   noteId: string,
// ): Promise<ActionResult> {
//   const uid = await requireUser();
//   const existing = await getOwnedContact(uid, contactId);
//   if (!existing) {
//     return actionError(NOT_FOUND);
//   }
//   if (!isUuid(noteId)) {
//     return actionError(NOTE_NOT_FOUND);
//   }
//   const deleted = await db
//     .delete(notes)
//     .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)))
//     .returning({ id: notes.id });
//   if (deleted.length === 0) {
//     return actionError(NOTE_NOT_FOUND);
//   }
//   revalidatePath("/");
//   return { ok: true };
// }
