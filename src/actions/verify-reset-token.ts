"use server";

import { getUserByEmail } from "@/data/user";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getTranslations } from "next-intl/server";

export const verifyResetToken = async (token: string) => {
  const resetToken = await getPasswordResetTokenByToken(token);
  const t = await getTranslations("NewPasswordForm");

  if (!resetToken) {
    return {
      error: t("schema.errors.invalidToken"),
    };
  }

  if (resetToken.expiresAt < new Date()) {
    return {
      error: t("schema.errors.expiredToken"),
    };
  }

  const user = await getUserByEmail(resetToken.email);

  if (!user) {
    return {
      error: t("schema.errors.userNotFound"),
    };
  }

  return {
    success: t("schema.success.tokenVerified"),
    resetToken,
  };
};
