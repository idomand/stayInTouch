import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * One row per link request that triggered an invite email — the log behind the
 * daily invite limit. Not counted from `link_requests`: those rows are deleted
 * with the sender's contact, so "add contact → send → delete contact" would
 * reset the count. No FK, for the same reason.
 */
export const inviteEmailsSent = pgTable(
  "invite_emails_sent",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUserId: text("from_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("invite_emails_sent_user_time_idx").on(
      table.fromUserId,
      table.createdAt,
    ),
  ],
);

/**
 * Addresses that asked not to get invite emails (normalized: trimmed,
 * lower-case). Kept only to honour that choice.
 */
export const emailOptOuts = pgTable("email_opt_outs", {
  email: text("email").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
