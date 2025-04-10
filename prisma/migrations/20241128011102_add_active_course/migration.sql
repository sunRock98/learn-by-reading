-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activeCourseId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_activeCourseId_fkey" FOREIGN KEY ("activeCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
