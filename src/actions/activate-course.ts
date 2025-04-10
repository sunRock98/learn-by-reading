"use server";
import { activateCourseToUser } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";

export const activateCourse = async (id: number) => {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return { error: "errors.notAuthorized" };
    }

    const updatedUser = await activateCourseToUser({
      userId: user.id,
      courseId: id,
    });

    if (!updatedUser) {
      return { error: "errors.sthWentWrong" };
    }
    return { success: "Activated", activeCourse: id };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};
