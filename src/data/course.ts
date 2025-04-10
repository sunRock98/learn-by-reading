import { db } from "@/lib/db";

export const createCourse = async ({
  languageId,
  levelId,
}: {
  languageId: number;
  levelId: number;
}) => {
  try {
    const existingCourse = await db.course.findFirst({
      where: {
        languageId,
        levelId,
      },
    });

    if (existingCourse) {
      return existingCourse;
    }

    const newCourse = await db.course.create({
      data: {
        languageId,
        levelId,
      },
    });
    return newCourse;
  } catch (error) {
    return null;
  }
};
