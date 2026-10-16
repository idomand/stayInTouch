import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Per-user preferences that must follow the account, not the browser. One row
 * per user, created on the first change; a missing row means every default.
 * `owner_id` is the Firebase uid as bare text with no FK, same as `contacts`.
 */
export const userSettings = pgTable("user_settings", {
  ownerId: text("owner_id").primaryKey(),
  /**
   * Overdue reminder emails: NULL is off (the default), a timestamp is on since
   * then. The job only emails contacts that became due after this moment, so
   * turning it on does not send one email for every contact already red.
   */
  overdueRemindersSince: timestamp("overdue_reminders_since", {
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
