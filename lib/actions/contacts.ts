"use server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  getOwnedContact,
  isUuid,
  requireUser,
} from "@/lib/db/queries/guards";
import { contacts, notes, talkEvents } from "@/lib/db/schema";
import { actionError } from "@/lib/actions/actionError";
import {
  type ActionResult,
  type ErrorMessage,
  isUniqueViolation,
  normalizeEmail,
  validateFields,
  validateNoteBody,
} from "@/lib/actions/validation";

const NOT_FOUND: ErrorMessage = { key: "contactNotFound" };
const NOTE_NOT_FOUND: ErrorMessage = { key: "noteNotFound" };
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

export async function addContact(input: AddContactInput): Promise<ActionResult> {
  const uid = await requireUser();
  const invalid =
    validateFields(input) ??
    validateNoteBody(input.note, { optional: true });
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

/** Record a talk now — one append-only row, no more "Talked on:" note. */
export async function markAsTalked(contactId: string): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  const talkedAt = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(talkEvents).values({ contactId, createdBy: uid, talkedAt });
    // The same talk on the linked contact, owned by the other user. The link
    // row is the only permission for this cross-user write. Zero rows when the
    // contact is not linked, so no `if`.
    await tx.execute(sql`
      INSERT INTO talk_events (contact_id, created_by, talked_at)
      SELECT CASE WHEN l.contact_a_id = ${contactId}
                  THEN l.contact_b_id ELSE l.contact_a_id END,
             ${uid}, ${talkedAt}
      FROM contact_links l
      WHERE l.contact_a_id = ${contactId} OR l.contact_b_id = ${contactId}
    `);
  });
  revalidatePath("/");
  return { ok: true };
}

export async function addNote(
  contactId: string,
  body: string,
): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  const invalid = validateNoteBody(body);
  if (invalid) {
    return actionError(invalid);
  }
  await db.insert(notes).values({ contactId, body: body.trim() });
  revalidatePath("/");
  return { ok: true };
}

export async function updateNote(
  contactId: string,
  noteId: string,
  body: string,
): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  if (!isUuid(noteId)) {
    return actionError(NOTE_NOT_FOUND);
  }
  const invalid = validateNoteBody(body);
  if (invalid) {
    return actionError(invalid);
  }
  const updated = await db
    .update(notes)
    .set({ body: body.trim() })
    .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)))
    .returning({ id: notes.id });
  if (updated.length === 0) {
    return actionError(NOTE_NOT_FOUND);
  }
  revalidatePath("/");
  return { ok: true };
}

export async function deleteNote(
  contactId: string,
  noteId: string,
): Promise<ActionResult> {
  const uid = await requireUser();
  const existing = await getOwnedContact(uid, contactId);
  if (!existing) {
    return actionError(NOT_FOUND);
  }
  if (!isUuid(noteId)) {
    return actionError(NOTE_NOT_FOUND);
  }
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)))
    .returning({ id: notes.id });
  if (deleted.length === 0) {
    return actionError(NOTE_NOT_FOUND);
  }
  revalidatePath("/");
  return { ok: true };
}
