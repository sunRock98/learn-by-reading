-- filepath: prisma/migrations/<timestamp>_add_title_to_text/migration.sql
ALTER TABLE "Text" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Untitled';
UPDATE "Text" SET "title" = 'Default Title' WHERE "title" IS NULL;

