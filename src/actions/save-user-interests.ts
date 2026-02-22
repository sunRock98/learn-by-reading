"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function saveUserInterests(interests: string[]) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return { error: "Not authenticated" };
  }

  await db.user.update({
    where: { id: user.id },
    data: { interests },
  });

  return { success: true };
}

export async function getUserInterests(): Promise<string[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    return [];
  }

  const userData = await db.user.findUnique({
    where: { id: user.id },
    select: { interests: true },
  });

  return userData?.interests ?? [];
}
