/*
  Warnings:

  - Added the required column `fromLanguageId` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toLanguageId` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "fromLanguageId" INTEGER NOT NULL,
ADD COLUMN     "toLanguageId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_fromLanguageId_fkey" FOREIGN KEY ("fromLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_toLanguageId_fkey" FOREIGN KEY ("toLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
