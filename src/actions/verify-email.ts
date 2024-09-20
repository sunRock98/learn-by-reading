"use server";

import { getUserByEmail } from "@/data/user";
import { getEmailVerificationTokenByToken } from "@/data/email-verification-token";
import { db } from "@/lib/db";

export const verifyEmail = async (token: string) => {
  const verificationToken = await getEmailVerificationTokenByToken(token);

  if (!verificationToken) {
    return {
      error: "Invalid token",
    };
  }

  if (verificationToken.expiresAt < new Date()) {
    return {
      error: "Token has expired",
    };
  }

  const user = await getUserByEmail(verificationToken.email);

  if (!user) {
    return {
      error: "User not found",
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
    success: "Email has verified!",
  };
};
