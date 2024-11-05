"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/routes";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export const deleteUserLanguage = async (id: number) => {
  const t = await getTranslations("LanguageSelectForm");
  const user = await getCurrentUser();
  if (!user) {
    return { error: t("errors.notAuthorized") };
  }

  try {
    const deletedLanguage = await db.userLanguage.delete({ where: { id } });
    if (!deletedLanguage) {
      return { error: "errors.sthWentWrong" };
    }
    revalidatePath(ROUTES.LanguageSetting);
    return { success: "Deleted", deletedLanguage };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};
