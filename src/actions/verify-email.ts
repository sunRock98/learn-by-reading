"use server";

import { getUserByEmail } from "@/data/user";
import { getEmailVerificationTokenByToken } from "@/data/email-verification-token";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export const verifyEmail = async (token: string) => {
  const t = await getTranslations("verifyEmail");
  const verificationToken = await getEmailVerificationTokenByToken(token);

  if (!verificationToken) {
    return {
      error: t("schema.errors.invalidToken"),
    };
  }

  if (verificationToken.expiresAt < new Date()) {
    return {
      error: t("schema.errors.expiredToken"),
    };
  }

  const user = await getUserByEmail(verificationToken.email);

  if (!user) {
    return {
      error: t("schema.errors.userNotFound"),
    };
  }

  await db.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date(), email: user.email },
  });

  await db.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return {
    success: t("schema.success.emailVerified"),
  };
};
