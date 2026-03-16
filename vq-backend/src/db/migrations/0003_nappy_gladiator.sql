ALTER TABLE "draws" ADD COLUMN "slot_number" integer;
WITH ordered_draws AS (
  SELECT "id", ((ROW_NUMBER() OVER (ORDER BY "created_at") - 1) % 3) + 1 AS slot_number
  FROM "draws"
)
UPDATE "draws"
SET "slot_number" = ordered_draws.slot_number
FROM ordered_draws
WHERE "draws"."id" = ordered_draws."id";
ALTER TABLE "draws" ALTER COLUMN "slot_number" SET NOT NULL;
