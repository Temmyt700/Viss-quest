CREATE TABLE IF NOT EXISTS "referral_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"reward_amount" numeric(12, 2) DEFAULT '500' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "draw_entries_draw_prize_user_idx" ON "draw_entries" USING btree ("draw_prize_id","user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "winners_draw_announced_idx" ON "winners" USING btree ("draw_id","announced_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "winners_draw_selected_idx" ON "winners" USING btree ("draw_id","selected_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spin_history_user_spin_date_idx" ON "spin_history" USING btree ("user_id","spin_date");

