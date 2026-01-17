-- AlterTable
ALTER TABLE "Word" ADD COLUMN "consecutiveNoClicks" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WordTextAppearance" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "textId" INTEGER NOT NULL,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordTextAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordTextAppearance_wordId_textId_key" ON "WordTextAppearance"("wordId", "textId");

-- AddForeignKey
ALTER TABLE "WordTextAppearance" ADD CONSTRAINT "WordTextAppearance_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTextAppearance" ADD CONSTRAINT "WordTextAppearance_textId_fkey" FOREIGN KEY ("textId") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;
