import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiTokens } from "@/lib/db/schema";
import { adminAuth } from "@/lib/firebaseAdmin";

/**
 * Personal access tokens: the identity source for the MCP endpoint, as
 * getServerUser() is for pages and Server Actions. A token names its owner;
 * the uid returned by verifyApiToken() is the only uid an MCP tool may use.
 */

const TOKEN_PREFIX = "sit_";
/** Characters of the token shown on /settings: "sit_" plus four more. */
const DISPLAY_PREFIX_LENGTH = TOKEN_PREFIX.length + 4;

/** A new random token and what to store for it. The token is shown once. */
export function createApiTokenSecret(): {
  token: string;
  tokenHash: string;
  tokenPrefix: string;
} {
  const token = TOKEN_PREFIX + randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashApiToken(token),
    tokenPrefix: token.slice(0, DISPLAY_PREFIX_LENGTH),
  };
}

export function hashApiToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * The owner's uid for a valid token, else null. Also checks the Firebase user,
 * as the session cookie check does: a deleted or disabled user, or one whose
 * email is no longer verified, is rejected even while the token row exists.
 */
export async function verifyApiToken(
  token: string | undefined,
): Promise<string | null> {
  if (!token?.startsWith(TOKEN_PREFIX)) {
    return null;
  }
  const [row] = await db
    .select({ id: apiTokens.id, ownerId: apiTokens.ownerId })
    .from(apiTokens)
    .where(eq(apiTokens.tokenHash, hashApiToken(token)))
    .limit(1);
  if (!row) {
    return null;
  }

  try {
    const user = await adminAuth.getUser(row.ownerId);
    if (user.disabled || !user.emailVerified) {
      return null;
    }
  } catch {
    // Fail closed: the Firebase user is gone, or Firebase is unreachable.
    return null;
  }

  await db
    .update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, row.id));
  return row.ownerId;
}
