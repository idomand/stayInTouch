import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Personal access tokens for the MCP endpoint (`/api/mcp`). An agent sends
 * `Authorization: Bearer <token>` instead of a session cookie. Only the SHA-256
 * of the token is stored: it has 256 random bits, so a slow hash adds nothing,
 * and a leaked table cannot be used to sign in. Revoking deletes the row.
 * `owner_id` is the Firebase uid as bare text with no FK, same as `contacts`.
 */
export const apiTokens = pgTable(
  "api_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    /** The user's label, e.g. "Claude Code on laptop". */
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    /** The first characters of the token, so the user can tell tokens apart. */
    tokenPrefix: text("token_prefix").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => [index("api_tokens_owner_idx").on(table.ownerId)],
);

export type ApiToken = typeof apiTokens.$inferSelect;
