"use server";
import { getUserByEmail } from "@/data/user";
import { sendResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";
import { ResetSchema } from "@/schemas";
import { z } from "zod";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    // TODO: change to fake success in production
    // return { success: "Reset email sent!" };
    return { error: "Invalid email!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  const { error } = await sendResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  if (error) {
    return { error: "Something went wrong!" };
  }

  return { success: "Reset email sent!" };
};
