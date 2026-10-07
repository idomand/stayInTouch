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
  const expected = Buffer.from(signEmail(email));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
