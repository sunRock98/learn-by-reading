"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCourse } from "@/data/course";
import { subscribeUserToCourse } from "@/data/user";

interface SyncGuestDataParams {
  interests: string[];
  language?: { id: number; name: string; code: string } | null;
  level?: { id: number; name: string } | null;
}

export async function syncGuestData({
  interests,
  language,
  level,
}: SyncGuestDataParams) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return { error: "Not authenticated" };
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { interests: true, subscriptions: { select: { id: true } } },
  });

  if (!dbUser) {
    return { error: "User not found" };
  }

  // Merge interests: keep existing ones and add new guest interests
  const existingInterests = dbUser.interests ?? [];
  const mergedInterests = Array.from(
    new Set([...existingInterests, ...interests])
  );

  await db.user.update({
    where: { id: user.id },
    data: { interests: mergedInterests },
  });

  // Subscribe user to the course from guest onboarding if they don't have any courses
  if (language && level && dbUser.subscriptions.length === 0) {
    try {
      const course = await createCourse({
        languageId: language.id,
        levelId: level.id,
      });

      if (course) {
        await subscribeUserToCourse(user.id, course.id);
      }
    } catch (e) {
      console.error("Failed to subscribe to course from guest data:", e);
    }
  }

  return { success: true };
}
