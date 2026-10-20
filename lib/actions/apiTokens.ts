"use server";
import { and, count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isUuid, requireUser } from "@/lib/db/queries/guards";
import { apiTokens } from "@/lib/db/schema";
import { createApiTokenSecret } from "@/lib/auth/apiToken";
import { actionError } from "@/lib/actions/actionError";
import type { ActionResult, ErrorMessage } from "@/lib/actions/validation";
import { maxApiTokensPerUser, maxNameLength } from "@/lib/ConstantsFile";

const TOKEN_NOT_FOUND: ErrorMessage = { key: "apiTokenNotFound" };

/**
 * Creates an MCP access token for the caller. The token itself is returned
 * once, here; only its hash is stored, so it can never be shown again.
 */
export async function createApiToken(
  name: unknown,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const uid = await requireUser();
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) {
    return actionError({ key: "nameRequired" });
  }
  if (trimmed.length > maxNameLength) {
    return actionError({ key: "nameTooLong", values: { max: maxNameLength } });
  }

  const { token, tokenHash, tokenPrefix } = createApiTokenSecret();
  const created = await db.transaction(async (tx) => {
    // Serializes this user's creates so two parallel requests cannot both
    // pass the limit check.
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${`api-token:${uid}`}))`,
    );
    const [existing] = await tx
      .select({ value: count() })
      .from(apiTokens)
      .where(eq(apiTokens.ownerId, uid));
    if (existing.value >= maxApiTokensPerUser) {
      return false;
    }
    await tx
      .insert(apiTokens)
      .values({ ownerId: uid, name: trimmed, tokenHash, tokenPrefix });
    return true;
  });
  if (!created) {
    return actionError({
      key: "apiTokenLimitReached",
      values: { limit: maxApiTokensPerUser },
    });
  }

  revalidatePath("/settings");
  return { ok: true, token };
}

/** Revokes one of the caller's tokens. Agents using it get 401 from then on. */
export async function revokeApiToken(tokenId: unknown): Promise<ActionResult> {
  const uid = await requireUser();
  if (!isUuid(tokenId)) {
    return actionError(TOKEN_NOT_FOUND);
  }
  const deleted = await db
    .delete(apiTokens)
    .where(and(eq(apiTokens.id, tokenId), eq(apiTokens.ownerId, uid)))
    .returning({ id: apiTokens.id });
  if (deleted.length === 0) {
    return actionError(TOKEN_NOT_FOUND);
  }
  revalidatePath("/settings");
  return { ok: true };
}
