"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { getTranslations } from "next-intl/server";

export const login = async (
  values: z.infer<ReturnType<typeof LoginSchema>>,
  callbackUrl?: string | null
) => {
  const t = await getTranslations("LoginForm");
  const loginSchema = LoginSchema(t);
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: t("schema.errors.invalidFields") };
  }

  const { email, password } = validatedFields.data;

  const user = await getUserByEmail(email);

  if (!user || !user.password) {
    return { error: t("schema.errors.invalidCreds") };
  }

  if (!user.emailVerified) {
    const verificationToken = await generateVerificationToken(email);

    const { error } = await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
      user.name ?? ""
    );

    if (error) {
      // TODO: log error
      console.error(error);
      return { error: t("schema.errors.sthWentWrong") };
    }

    return { success: t("schema.success.emailSent") };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });

    return { success: t("schema.success.loggedIn") };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: t("schema.errors.invalidCreds") };
        default:
          return { error: t("schema.errors.sthWentWrong") };
      }
    }

    throw error;
  }
};
