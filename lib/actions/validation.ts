import type { Messages } from "next-intl";
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

/**
 * A user-facing error as a message key (plus values), not text. Actions turn it
 * into a translated ActionResult with actionError().
 */
export type ErrorMessage = {
  key: keyof Messages["errors"];
  values?: Record<string, string | number>;
};

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

export function validateFields(input: ContactFieldsInput): ErrorMessage | null {
  if (typeof input !== "object" || input === null) {
    return { key: "invalidInput" };
  }
  const { name, cadenceDays, friendEmail, talkedAtMs } = input;
  if (typeof name !== "string" || !name.trim()) {
    return { key: "nameRequired" };
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return { key: "nameTooLong", values: { max: MAX_NAME_LENGTH } };
  }
  if (
    !Number.isInteger(cadenceDays) ||
    cadenceDays < 1 ||
    cadenceDays > maxCadenceDays
  ) {
    return { key: "cadenceOutOfRange", values: { max: maxCadenceDays } };
  }
  if (friendEmail != null) {
    const email = typeof friendEmail === "string" ? friendEmail.trim() : null;
    if (email === null || (email && !isValidEmail(email))) {
      return { key: "emailInvalid" };
    }
  }
  if (talkedAtMs != null) {
    // new Date() of a finite but out-of-range number is an Invalid Date, which
    // Postgres rejects — so check the Date, not just the number.
    if (
      typeof talkedAtMs !== "number" ||
      Number.isNaN(new Date(talkedAtMs).getTime())
    ) {
      return { key: "talkDateInvalid" };
    }
    // A future talk would make "days since last talk" negative. One day of
    // slack covers client clock and time-zone skew.
    if (talkedAtMs > Date.now() + ONE_DAY_MS) {
      return { key: "talkDateInFuture" };
    }
  }
  return null;
}

/** Checks a note body. `optional` allows a missing or blank note (addContact). */
export function validateNoteBody(
  body: unknown,
  { optional = false }: { optional?: boolean } = {},
): ErrorMessage | null {
  if (optional && body == null) {
    return null;
  }
  if (typeof body !== "string") {
    return { key: "noteInvalid" };
  }
  const length = body.trim().length;
  if (!length) {
    return optional ? null : { key: "noteEmpty" };
  }
  if (length > MAX_NOTE_LENGTH) {
    return { key: "noteTooLong", values: { max: MAX_NOTE_LENGTH } };
  }
  return null;
}

/** Empty/whitespace email becomes NULL — "no email", not the empty string. */
export function normalizeEmail(email?: string | null): string | null {
  const trimmed = email?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Postgres unique_violation — a unique index rejected a duplicate. Drizzle
 * wraps driver errors in DrizzleQueryError and keeps the Postgres error in
 * `cause`, so walk the cause chain instead of reading only the top level.
 */
export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ((current as { code?: unknown }).code === "23505") {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
