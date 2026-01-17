"use server";

import { getUserByEmail } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SettingsSchema } from "@/schemas";
import * as z from "zod";
import { getTranslations } from "next-intl/server";

export const updateUserSettings = async (
  values: z.infer<ReturnType<typeof SettingsSchema>>
) => {
  const user = await getCurrentUser();
  const t = await getTranslations("updateSettings");

  const newValues: {
    name?: string;
    email?: string;
    password?: string;
    nativeLanguage?: string;
  } = {
    name: values.name,
    email: values.email,
    password: undefined,
    nativeLanguage: values.nativeLanguage,
  };

  if (!user) {
    return { error: t("errors.notAuthorized") };
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return { error: t("errors.userNotFound") };
  }

  if (!user.isOAuth) {
    if (values.email && values.email !== dbUser.email) {
      const existingUser = await getUserByEmail(values.email);

      if (existingUser && existingUser.id !== user.id) {
        return { error: t("errors.emailExists") };
      }
      // TODO: Implement new email verification
      // const verificationToken = await generateVerificationToken(values.email);

      // await sendVerificationEmail(
      //   verificationToken.email,
      //   verificationToken.token,
      //   values.name ?? dbUser.name ?? ""
      // );

      // return {
      //   success: "Please verify your new email address",
      //   error: undefined,
      // };
    }

    if (values.password && values.newPassword && dbUser.password) {
      const isPasswordMatches = await bcrypt.compare(
        values.password,
        dbUser.password
      );

      if (!isPasswordMatches) {
        return { error: t("errors.invalidPassword") };
      }

      const hashedPassword = await bcrypt.hash(values.newPassword, 10);
      newValues.password = hashedPassword;
    }
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...newValues,
    },
  });

  return {
    success: t("success.updated"),
    error: undefined,
  };
};
