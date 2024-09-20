"use server";

import { getUserByEmail } from "@/data/user";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";

export const verifyResetToken = async (token: string) => {
  const resetToken = await getPasswordResetTokenByToken(token);

  if (!resetToken) {
    return {
      error: "Invalid token",
    };
  }

  if (resetToken.expiresAt < new Date()) {
    return {
      error: "Token has expired",
    };
  }

  const user = await getUserByEmail(resetToken.email);

  if (!user) {
    return {
      error: "User not found",
    };
  }

  return {
    success: "Reset token is valid!",
    resetToken,
  };
};
