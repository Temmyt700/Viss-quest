ALTER TABLE "winners" ALTER COLUMN "announced_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "winners" ALTER COLUMN "announced_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "winners" ADD COLUMN "entry_id" uuid;--> statement-breakpoint
ALTER TABLE "winners" ADD COLUMN "selected_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_entry_id_draw_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."draw_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "winners_entry_id_idx" ON "winners" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "winners_selected_at_idx" ON "winners" USING btree ("selected_at");