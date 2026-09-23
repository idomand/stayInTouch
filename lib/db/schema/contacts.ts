import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * One row per person the user keeps in touch with. Replaces the Firestore
 * collection-per-user model (`${email}${uid}`): ownership is now a queryable
 * `owner_id` column instead of the collection name.
 *
 * `owner_id` is a Firebase uid stored as bare text with no foreign key — there
 * is no users table because identity stays in Firebase. It is the permanent uid,
 * not the mutable email, so changing your Google email no longer orphans data.
 */
export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    cadenceDays: integer("cadence_days").notNull().default(7),
    // Nullable on purpose: NULL means "no email", never the empty string.
    friendEmail: text("friend_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Enforce unique contact name per owner, case-insensitively, in the database
    // instead of the old browser-side check that two tabs could both race past.
    uniqueIndex("contacts_owner_name_unique").on(
      table.ownerId,
      sql`lower(${table.name})`,
    ),
    index("contacts_owner_idx").on(table.ownerId),
    check("cadence_days_positive", sql`${table.cadenceDays} > 0`),
  ],
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
