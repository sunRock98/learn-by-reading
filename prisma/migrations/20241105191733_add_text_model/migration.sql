/*
  Warnings:

  - You are about to drop the `UserLanguage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLanguageText` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserLanguage" DROP CONSTRAINT "UserLanguage_languageId_fkey";

-- DropForeignKey
ALTER TABLE "UserLanguage" DROP CONSTRAINT "UserLanguage_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLanguageText" DROP CONSTRAINT "UserLanguageText_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserLanguageText" DROP CONSTRAINT "UserLanguageText_textId_fkey";

-- DropTable
DROP TABLE "UserLanguage";

-- DropTable
DROP TABLE "UserLanguageText";

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseText" (
    "courseId" INTEGER NOT NULL,
    "textId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseText_pkey" PRIMARY KEY ("courseId","textId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_userId_languageId_level_key" ON "Course"("userId", "languageId", "level");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseText" ADD CONSTRAINT "CourseText_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseText" ADD CONSTRAINT "CourseText_textId_fkey" FOREIGN KEY ("textId") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;
