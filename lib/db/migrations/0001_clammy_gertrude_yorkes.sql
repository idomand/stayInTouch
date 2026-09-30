CREATE TYPE "public"."link_request_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "contact_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_a_id" uuid NOT NULL,
	"contact_b_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contact_links_ordered_pair" CHECK ("contact_links"."contact_a_id" < "contact_links"."contact_b_id")
);
--> statement-breakpoint
CREATE TABLE "link_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" text NOT NULL,
	"from_contact_id" uuid NOT NULL,
	"from_name" text NOT NULL,
	"from_email" text NOT NULL,
	"to_email" text NOT NULL,
	"status" "link_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	CONSTRAINT "link_requests_not_self" CHECK ("link_requests"."to_email" <> "link_requests"."from_email")
);
--> statement-breakpoint
ALTER TABLE "contact_links" ADD CONSTRAINT "contact_links_contact_a_id_contacts_id_fk" FOREIGN KEY ("contact_a_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_links" ADD CONSTRAINT "contact_links_contact_b_id_contacts_id_fk" FOREIGN KEY ("contact_b_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_requests" ADD CONSTRAINT "link_requests_from_contact_id_contacts_id_fk" FOREIGN KEY ("from_contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contact_links_pair_unique" ON "contact_links" USING btree ("contact_a_id","contact_b_id");--> statement-breakpoint
CREATE INDEX "contact_links_contact_b_idx" ON "contact_links" USING btree ("contact_b_id");--> statement-breakpoint
CREATE UNIQUE INDEX "link_requests_one_pending_per_contact" ON "link_requests" USING btree ("from_contact_id") WHERE "link_requests"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "link_requests_pending_to_email_idx" ON "link_requests" USING btree ("to_email") WHERE "link_requests"."status" = 'pending';