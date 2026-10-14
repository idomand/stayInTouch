import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contacts } from "./contacts";

/**
 * History of talks with a contact. Replaces the single overwritten
 * `timeFromLastTalk` number and the cosmetic "Talked on:" note: every talk
 * inserts a row, rows are never updated, and "last talked" becomes the newest
 * row for the contact. The user can add a past talk or delete a row from the
 * history dialog.
 *
 * `talked_at` is when the conversation happened (may be backdated). `created_at`
 * is when the row was written and never changes — the audit trail.
 *
 * `created_by` is a Firebase uid in bare text (no FK). On a linked contact a row
 * may have been created by the other side; this records who.
 *
 * `shared_id` is the same value on the two rows one talk writes on a linked
 * pair, so deleting it on one side can delete it on the other. Null on rows
 * written before the column existed; those delete on one side only.
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
    sharedId: uuid("shared_id"),
  },
  (table) => [
    // Filter column first, sort column DESC second, so "newest event for this
    // contact" is served straight off the index with no read-time sort.
    index("talk_events_contact_talked_idx").on(
      table.contactId,
      table.talkedAt.desc(),
    ),
    index("talk_events_shared_id_idx").on(table.sharedId),
  ],
);

export type TalkEvent = typeof talkEvents.$inferSelect;
export type NewTalkEvent = typeof talkEvents.$inferInsert;
