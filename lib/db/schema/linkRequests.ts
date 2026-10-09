import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { contacts } from "./contacts";

export const linkRequestStatus = pgEnum("link_request_status", [
  "pending",
  "accepted",
  "rejected",
]);

/**
 * A request from one user to link one of their contacts with another user.
 *
 * Addressed to an email (`to_email`, normalized: trimmed, lower-case), not a
 * uid. Resolving the email to a uid would make the sender's outgoing list show
 * only emails that have an account — revealing who uses the app. The addressee
 * finds requests by their verified session email instead.
 *
 * `from_name` / `from_email` are a snapshot of the sender, the only things the
 * addressee sees. Rejected and accepted rows stay as history; a rejected pair
 * may send again.
 */
export const linkRequests = pgTable(
  "link_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUserId: text("from_user_id").notNull(),
    fromContactId: uuid("from_contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    fromName: text("from_name").notNull(),
    fromEmail: text("from_email").notNull(),
    toEmail: text("to_email").notNull(),
    status: linkRequestStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "link_requests_not_self",
      sql`${table.toEmail} <> ${table.fromEmail}`,
    ),
    // At most one open request per contact; history rows are not constrained.
    uniqueIndex("link_requests_one_pending_per_contact")
      .on(table.fromContactId)
      .where(sql`${table.status} = 'pending'`),
    // The addressee's incoming list: "pending requests to my email".
    index("link_requests_pending_to_email_idx")
      .on(table.toEmail)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export type LinkRequest = typeof linkRequests.$inferSelect;
export type NewLinkRequest = typeof linkRequests.$inferInsert;
