import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contacts } from "./contacts";

/**
 * A note the user wrote about a contact. Replaces the embedded `notesArray` on
 * the Firestore document: each note is now its own row, so editing one is a
 * single-row UPDATE instead of rewriting the whole document, and ids are
 * database-generated (the old hand-rolled `noteId` reused ids after a delete).
 *
 * Notes are private to the owning contact and are never shared across a link.
 */
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("notes_contact_idx").on(table.contactId)],
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
