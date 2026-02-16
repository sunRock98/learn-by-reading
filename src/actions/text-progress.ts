"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Marks a text as completed for the current user.
 * Upserts a UserProgress record with seen: true.
 */
export async function markTextAsComplete(textId: number, courseId: number) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Verify the text belongs to the course
    const text = await db.text.findUnique({
      where: { id: textId, courseId },
      select: { id: true },
    });

    if (!text) {
      return { success: false, error: "Text not found" };
    }

    // Upsert the user progress record
    await db.userProgress.upsert({
      where: {
        userId_textId: {
          userId: user.id,
          textId,
        },
      },
      create: {
        userId: user.id,
        textId,
        seen: true,
        current: false,
      },
      update: {
        seen: true,
      },
    });

    revalidatePath(`/course/${courseId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error marking text as complete:", error);
    return { success: false, error: "Failed to mark text as complete" };
  }
}
