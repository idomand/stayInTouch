import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { contacts } from "./contacts";

/**
 * An accepted link between two contacts owned by two different users. When
 * either side marks "talked", the talk is recorded on both contacts.
 *
 * One row per link, not a `linked_user_id` column on each contact: a single row
 * cannot be half-linked, and deleting either contact removes the link through
 * the cascade. `contact_a_id < contact_b_id` keeps one row per pair.
 *
 * "A contact is in at most one link" spans both columns, which an index cannot
 * express; the accept transaction enforces it with row locks.
 */
export const contactLinks = pgTable(
  "contact_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactAId: uuid("contact_a_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    contactBId: uuid("contact_b_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "contact_links_ordered_pair",
      sql`${table.contactAId} < ${table.contactBId}`,
    ),
    // Also serves lookups by contact_a_id (leading column).
    uniqueIndex("contact_links_pair_unique").on(
      table.contactAId,
      table.contactBId,
    ),
    index("contact_links_contact_b_idx").on(table.contactBId),
  ],
);

export type ContactLink = typeof contactLinks.$inferSelect;
export type NewContactLink = typeof contactLinks.$inferInsert;
