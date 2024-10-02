"use server";
import { getUserByEmail } from "@/data/user";
import { sendResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";
import { ResetSchema } from "@/schemas";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

export const reset = async (
  values: z.infer<ReturnType<typeof ResetSchema>>
) => {
  const t = await getTranslations("ResetForm");

  const resetSchema = ResetSchema(t);
  const validatedFields = resetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: t("schema.errors.invalidEmail") };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    // TODO: change to fake success in production
    // return { success: "Reset email sent!" };
    return { error: t("schema.errors.invalidEmail") };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  const { error } = await sendResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  if (error) {
    return { error: t("schema.errors.sthWentWrong") };
  }

  return { success: t("schema.success.emailSent") };
};
