CREATE TABLE "spin_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spin_cost" numeric(12, 2) DEFAULT '15' NOT NULL,
	"max_daily_payout" numeric(12, 2) DEFAULT '5000' NOT NULL,
	"max_single_reward" numeric(12, 2) DEFAULT '1000' NOT NULL,
	"daily_spin_limit" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
