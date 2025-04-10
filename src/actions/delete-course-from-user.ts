"use server";

import { unsubscribeUserFromCourse } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { ROUTES } from "@/routes";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export const deleteCourse = async (id: number) => {
  const t = await getTranslations("LanguageSelectForm");
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return { error: t("errors.notAuthorized") };
  }

  try {
    const updatedUser = await unsubscribeUserFromCourse(user.id, id);
    if (!updatedUser) {
      return { error: t("errors.sthWentWrong") };
    }
    revalidatePath(ROUTES.LanguageSetting);

    return { success: "Unsubscibed", updatedUser };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};
