import { maxCadenceDays } from "@/lib/ConstantsFile";

/**
 * Input checks shared by the Server Actions. A Server Action is a public POST
 * endpoint: its TypeScript types are not enforced at runtime, so every argument
 * is checked. Limits never sit below the UI's own limits, so the server never
 * rejects what the UI allows; the cadence limit is shared with the forms
 * (maxCadenceDays). A plain module, not "use server": those files may only
 * export async functions.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_NOTE_LENGTH = 5000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// As loose as the browser's type="email" check, which accepts "a@b".
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

export type ContactFieldsInput = {
  name: string;
  cadenceDays: number;
  friendEmail?: string | null;
  talkedAtMs?: number;
};

/** True for a trimmed, non-empty email of a sane length and `x@y` shape. */
export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

export function validateFields(input: ContactFieldsInput): string | null {
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
    cadenceDays > maxCadenceDays
  ) {
    return `Cadence must be a whole number of days from 1 to ${maxCadenceDays}.`;
  }
  if (friendEmail != null) {
    const email = typeof friendEmail === "string" ? friendEmail.trim() : null;
    if (email === null || (email && !isValidEmail(email))) {
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
export function validateNoteBody(
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
export function normalizeEmail(email?: string | null): string | null {
  const trimmed = email?.trim();
  return trimmed ? trimmed : null;
}

/** Postgres unique_violation — a unique index rejected a duplicate. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
