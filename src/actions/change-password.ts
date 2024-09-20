"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { NewPasswordSchema } from "@/schemas";
import { verifyResetToken } from "./verify-reset-token";
import { db } from "@/lib/db";

export const changePassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token: string | null
) => {
  if (!token) {
    return {
      error: "Missing token!",
    };
  }
  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { password } = validatedFields.data;

  const verifyResponse = await verifyResetToken(token);

  if (verifyResponse.error) {
    return verifyResponse;
  }

  const { resetToken } = verifyResponse;

  if (!resetToken) {
    return {
      error: "Invalid token",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { email: resetToken.email },
    data: {
      password: hashedPassword,
    },
  });

  await db.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  return {
    success: "Password was changed!",
    error: undefined,
  };
};
