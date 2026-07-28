-- AlterTable
ALTER TABLE "Fleet" ADD COLUMN "slug" TEXT;

-- Backfill existing rows with a slug derived from their name
UPDATE "Fleet"
SET "slug" = trim(BOTH '-' FROM regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'));

-- Disambiguate any collisions produced by the backfill above
UPDATE "Fleet" f
SET "slug" = f."slug" || '-' || f.id
WHERE f."slug" IN (
  SELECT "slug" FROM "Fleet" GROUP BY "slug" HAVING count(*) > 1
);

ALTER TABLE "Fleet" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Fleet_slug_key" ON "Fleet"("slug");
