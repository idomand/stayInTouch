"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  getOwnedContact,
  isUuid,
  requireUser,
} from "@/lib/db/queries/guards";
import { contacts, notes, talkEvents } from "@/lib/db/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

// A Server Action is a public POST endpoint: the TypeScript types below are not
// enforced at runtime, so every argument is checked here. Limits sit above the
// UI's own limits so the server never rejects what the UI allows.
const MAX_NAME_LENGTH = 100;
const MAX_CADENCE_DAYS = 365;
const MAX_EMAIL_LENGTH = 254;
const MAX_NOTE_LENGTH = 5000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// As loose as the browser's type="email" check, which accepts "a@b".
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

const NOT_FOUND: ActionResult = { ok: false, error: "Contact not found." };
const NOTE_NOT_FOUND: ActionResult = { ok: false, error: "Note not found." };
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

function validateFields(input: UpdateContactInput): string | null {
  if (typeof input !== "object" || input === null) {
    return "Invalid input.";
  }
  const { name, cadenceDays, friendEmail, talkedAtMs } = input;
  if (typeof name !== "string" || !name.trim()) {
    return "Name is required.";
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return `Name must be at most ${MAX_NAME_LENGTH} characters.`;
  }
  if (
    !Number.isInteger(cadenceDays) ||
    cadenceDays < 1 ||
    cadenceDays > MAX_CADENCE_DAYS
  ) {
    return `Cadence must be a whole number of days from 1 to ${MAX_CADENCE_DAYS}.`;
  }
  if (friendEmail != null) {
    const email = typeof friendEmail === "string" ? friendEmail.trim() : null;
    if (
      email === null ||
      (email &&
        (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)))
    ) {
      return "Email is invalid.";
    }
  }
  if (talkedAtMs != null) {
    // new Date() of a finite but out-of-range number is an Invalid Date, which
    // Postgres rejects — so check the Date, not just the number.
    if (
      typeof talkedAtMs !== "number" ||
      Number.isNaN(new Date(talkedAtMs).getTime())
    ) {
      return "Last talk date is invalid.";
    }
    // A future talk would make "days since last talk" negative. One day of
    // slack covers client clock and time-zone skew.
    if (talkedAtMs > Date.now() + ONE_DAY_MS) {
      return "Last talk date cannot be in the future.";
    }
  }
  return null;
}

/** Checks a note body. `optional` allows a missing or blank note (addContact). */
function validateNoteBody(
  body: unknown,
  { optional = false }: { optional?: boolean } = {},
): string | null {
  if (optional && body == null) {
    return null;
  }
  if (typeof body !== "string") {
    return "Note is invalid.";
  }
  const length = body.trim().length;
  if (!length) {
    return optional ? null : "Note is empty.";
  }
  if (length > MAX_NOTE_LENGTH) {
    return `Note must be at most ${MAX_NOTE_LENGTH} characters.`;
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
  const invalid =
    validateFields(input) ??
    validateNoteBody(input.note, { optional: true });
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
  const invalid = validateFields(input);
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
  const invalid = validateNoteBody(body);
  if (invalid) {
    return { ok: false, error: invalid };
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
    return NOT_FOUND;
  }
  if (!isUuid(noteId)) {
    return NOTE_NOT_FOUND;
  }
  const invalid = validateNoteBody(body);
  if (invalid) {
    return { ok: false, error: invalid };
  }
  const updated = await db
    .update(notes)
    .set({ body: body.trim() })
    .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)))
    .returning({ id: notes.id });
  if (updated.length === 0) {
    return NOTE_NOT_FOUND;
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
    return NOT_FOUND;
  }
  if (!isUuid(noteId)) {
    return NOTE_NOT_FOUND;
  }
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.contactId, contactId)))
    .returning({ id: notes.id });
  if (deleted.length === 0) {
    return NOTE_NOT_FOUND;
  }
  revalidatePath("/");
  return { ok: true };
}
