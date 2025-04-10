/*
  Warnings:

  - A unique constraint covering the columns `[languageId,levelId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_languageId_levelId_key" ON "Course"("languageId", "levelId");
