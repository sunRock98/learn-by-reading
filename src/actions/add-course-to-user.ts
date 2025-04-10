"use server";

import { createCourse } from "@/data/course";
import { subscribeUserToCourse } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { ROUTES } from "@/routes";
import { LanguageSchema } from "@/schemas";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const addCourseToUser = async (
  values: z.infer<ReturnType<typeof LanguageSchema>>
) => {
  const t = await getTranslations("LanguageSelectForm");
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return { error: t("errors.notAuthorized") };
  }

  try {
    const course = await createCourse({
      languageId: Number(values.language),
      levelId: Number(values.level),
    });

    if (!course) {
      return { error: t("errors.sthWentWrong") };
    }

    const updatedUser = await subscribeUserToCourse(user.id, course.id);

    if (!updatedUser) {
      return { error: t("errors.sthWentWrong") };
    }
    revalidatePath(ROUTES.LanguageSetting);
    return { success: "Added", updatedUser };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        return { error: t("errors.languageAlreadyAdded") };
      }
    }
  }

  return { error: t("errors.sthWentWrong") };
};
