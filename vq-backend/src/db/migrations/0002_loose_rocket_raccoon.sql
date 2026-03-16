CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funding_approved" boolean DEFAULT true NOT NULL,
	"prize_won" boolean DEFAULT true NOT NULL,
	"referral_reward" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_user_id" text NOT NULL,
	"referee_user_id" text NOT NULL,
	"referral_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"qualifying_funding_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"reward_amount" numeric(12, 2) DEFAULT '500' NOT NULL,
	"qualified_at" timestamp with time zone,
	"rewarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referee_user_id_unique" UNIQUE("referee_user_id")
);
--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_user_id_users_id_fk" FOREIGN KEY ("referee_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;