import "server-only";
import { db } from "@/lib/db";
import { emailOptOuts } from "@/lib/db/schema";
import { verifyEmailToken } from "./unsubscribeToken";

/**
 * Adds an address to the opt-out list if the token from its unsubscribe link
 * is valid. Shared by the unsubscribe page's Server Action and the one-click
 * route. Returns false for a missing or wrong token. Opting out twice is fine.
 */
export async function addEmailOptOut(
  email: unknown,
  token: unknown,
): Promise<boolean> {
  if (typeof email !== "string" || typeof token !== "string") {
    return false;
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized || !verifyEmailToken(normalized, token)) {
    return false;
  }
  await db
    .insert(emailOptOuts)
    .values({ email: normalized })
    .onConflictDoNothing();
  return true;
}
