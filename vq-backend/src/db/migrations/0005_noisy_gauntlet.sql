CREATE TABLE "draw_prize_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draw_prize_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"image_public_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "draw_prize_images" ADD CONSTRAINT "draw_prize_images_draw_prize_id_draw_prizes_id_fk" FOREIGN KEY ("draw_prize_id") REFERENCES "public"."draw_prizes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "draw_prize_images_draw_prize_id_idx" ON "draw_prize_images" USING btree ("draw_prize_id");--> statement-breakpoint
CREATE INDEX "draw_prize_images_created_at_idx" ON "draw_prize_images" USING btree ("created_at");