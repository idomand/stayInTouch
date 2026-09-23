"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getOwnedContact, requireUser } from "@/lib/db/queries/guards";
import { contacts, notes, talkEvents } from "@/lib/db/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_FOUND: ActionResult = { ok: false, error: "Contact not found." };
const NAME_TAKEN: ActionResult = {
  ok: false,
  error: "A contact with this name already exists.",
};

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

function validateFields(name: string, cadenceDays: number): string | null {
  if (!name.trim()) {
    return "Name is required.";
  }
  if (!Number.isInteger(cadenceDays) || cadenceDays < 1) {
    return "Cadence must be a positive whole number of days.";
  }
  return null;
}

/** Empty/whitespace email becomes NULL — "no email", not the empty string. */
function normalizeEmail(email?: string | null): string | null {
  const trimmed = email?.trim();
  return trimmed ? trimmed : null;
}

/** Postgres unique_violation — the (owner_id, lower(name)) index rejected a dup. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function addContact(input: AddContactInput): Promise<ActionResult> {
  const uid = await requireUser();
  const invalid = validateFields(input.name, input.cadenceDays);
  if (invalid) {
    return { ok: false, error: invalid };
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
      return NAME_TAKEN;
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
    return NOT_FOUND;
  }
  const invalid = validateFields(input.name, input.cadenceDays);
  if (invalid) {
    return { ok: false, error: invalid };
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
      return NAME_TAKEN;
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
    return NOT_FOUND;
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
    return NOT_FOUND;
  }
  await db.insert(talkEvents).values({ contactId, createdBy: uid });
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
    return NOT_FOUND;
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Note is empty." };
  }
  await db.insert(notes).values({ contactId, body: trimmed });
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
    return NOT_FOUND;
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Note is empty." };
  }
  await db
    .update(notes)
    .set({ body: trimmed })
    .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)));
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
    return NOT_FOUND;
  }
  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)));
  revalidatePath("/");
  return { ok: true };
}
