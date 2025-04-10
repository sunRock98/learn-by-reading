/*
  Warnings:

  - Added the required column `content` to the `Text` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Text" ADD COLUMN     "content" TEXT NOT NULL;
