ALTER TABLE "talk_events" ADD COLUMN "shared_id" uuid;--> statement-breakpoint
CREATE INDEX "talk_events_shared_id_idx" ON "talk_events" USING btree ("shared_id");