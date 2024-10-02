"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { getTranslations } from "next-intl/server";

export const register = async (
  values: z.infer<ReturnType<typeof RegisterSchema>>
) => {
  const t = await getTranslations("RegisterForm");
  const registerSchema = RegisterSchema(t);
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: t("schema.errors.invalidFields") };
  }

  const { name, email, password } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: t("schema.errors.emailExists") };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token,
    name
  );

  return { success: t("schema.success.emailSent") };
};
