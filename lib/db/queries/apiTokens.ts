import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiTokens } from "@/lib/db/schema";

/** One token as /settings lists it. Never the hash. */
export type ApiTokenListItem = {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

/**
 * The user's MCP access tokens, newest first. The caller passes its own
 * session uid.
 */
export async function getApiTokens(uid: string): Promise<ApiTokenListItem[]> {
  const rows = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      tokenPrefix: apiTokens.tokenPrefix,
      createdAt: apiTokens.createdAt,
      lastUsedAt: apiTokens.lastUsedAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.ownerId, uid))
    .orderBy(desc(apiTokens.createdAt));
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  }));
}
