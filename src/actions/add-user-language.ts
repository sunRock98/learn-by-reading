"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/routes";
import { LanguageSchema } from "@/schemas";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const addUserLanguage = async (
  values: z.infer<ReturnType<typeof LanguageSchema>>
) => {
  const t = await getTranslations("LanguageSelectForm");
  const user = await getCurrentUser();
  if (!user) {
    return { error: t("errors.notAuthorized") };
  }

  try {
    const newLanguage = await db.userLanguage.create({
      data: {
        userId: user.id ?? "",
        languageId: Number(values.language),
        level: values.level,
      },
    });
    if (!newLanguage) {
      return { error: "error" };
    }
    revalidatePath(ROUTES.LanguageSetting);
    return { success: "Added", newLanguage };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        return { error: t("errors.languageAlreadyAdded") };
      }
    }
  }

  return { error: t("errors.sthWentWrong") };
};
