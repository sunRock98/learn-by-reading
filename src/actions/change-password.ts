"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { NewPasswordSchema } from "@/schemas";
import { verifyResetToken } from "./verify-reset-token";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export const changePassword = async (
  values: z.infer<ReturnType<typeof NewPasswordSchema>>,
  token: string | null
) => {
  const t = await getTranslations("NewPasswordForm");
  if (!token) {
    return {
      error: t("schema.errors.missingToken"),
    };
  }
  const newPasswordSchema = NewPasswordSchema(t);
  const validatedFields = newPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: t("schema.errors.invalidFields") };
  }

  const { password } = validatedFields.data;

  const verifyResponse = await verifyResetToken(token);

  if (verifyResponse.error) {
    return verifyResponse;
  }

  const { resetToken } = verifyResponse;

  if (!resetToken) {
    return {
      error: t("schema.errors.invalidToken"),
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
    success: t("schema.success.passwordChanged"),
    error: undefined,
  };
};
