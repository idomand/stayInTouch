import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { unsubscribeSecret } from "./client";

/**
 * Unsubscribe links carry an HMAC of the address, so only someone who got the
 * email can opt that address out. Callers pass a normalized (trimmed,
 * lower-case) email.
 */
export function signEmail(email: string): string {
  return createHmac("sha256", unsubscribeSecret)
    .update(email)
    .digest("base64url");
}

export function verifyEmailToken(email: string, token: string): boolean {
  return tokensMatch(signEmail(email), token);
}

/**
 * Overdue reminder opt-out links sign the uid, not the email: they turn off a
 * setting on the account. The prefix keeps these tokens apart from invite
 * opt-out tokens, which sign a bare email.
 */
export function signOverdueReminderOptOut(uid: string): string {
  return createHmac("sha256", unsubscribeSecret)
    .update(`overdue-reminder:${uid}`)
    .digest("base64url");
}

export function verifyOverdueReminderOptOutToken(
  uid: string,
  token: string,
): boolean {
  return tokensMatch(signOverdueReminderOptOut(uid), token);
}

function tokensMatch(expectedToken: string, actualToken: string): boolean {
  const expected = Buffer.from(expectedToken);
  const actual = Buffer.from(actualToken);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
