import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contacts } from "./contacts";

/**
 * Append-only history of "I talked to them" clicks. Replaces the single
 * overwritten `timeFromLastTalk` number and the cosmetic "Talked on:" note:
 * every click inserts a row, nothing is overwritten, and "last talked" becomes
 * the newest row for the contact.
 *
 * `talked_at` is when the conversation happened (may be backdated). `created_at`
 * is when the row was written and never changes — the audit trail.
 *
 * `created_by` is a Firebase uid in bare text (no FK). Once linking exists a row
 * on one contact may have been created by the other side clicking; this records
 * who.
 */
export const talkEvents = pgTable(
  "talk_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    talkedAt: timestamp("talked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Filter column first, sort column DESC second, so "newest event for this
    // contact" is served straight off the index with no read-time sort.
    index("talk_events_contact_talked_idx").on(
      table.contactId,
      table.talkedAt.desc(),
    ),
  ],
);

export type TalkEvent = typeof talkEvents.$inferSelect;
export type NewTalkEvent = typeof talkEvents.$inferInsert;
