CREATE TABLE "user_settings" (
	"owner_id" text PRIMARY KEY NOT NULL,
	"overdue_reminders_since" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "overdue_reminder_sent_at" timestamp with time zone;