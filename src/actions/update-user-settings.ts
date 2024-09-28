"use server";

import { getUserByEmail } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SettingsSchema } from "@/schemas";
import * as z from "zod";

export const updateUserSettings = async (
  values: z.infer<typeof SettingsSchema>
) => {
  const user = await getCurrentUser();

  const newValues: {
    name?: string;
    email?: string;
    password?: string;
  } = {
    name: values.name,
    email: values.email,
    password: undefined,
  };

  if (!user) {
    return { error: "Not authenticated" };
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return { error: "User not found" };
  }

  if (!user.isOAuth) {
    if (values.email && values.email !== dbUser.email) {
      const existingUser = await getUserByEmail(values.email);

      if (existingUser && existingUser.id !== user.id) {
        return { error: "Email already in use" };
      }
      // TODO: Implement new email verification
      // const verificationToken = await generateVerificationToken(values.email);

      // await sendVerificationEmail(
      //   verificationToken.email,
      //   verificationToken.token,
      //   values.name ?? dbUser.name ?? ""
      // );

      // return {
      //   success: "Please verify your new email address",
      //   error: undefined,
      // };
    }

    if (values.password && values.newPassword && dbUser.password) {
      const isPasswordMatches = await bcrypt.compare(
        values.password,
        dbUser.password
      );

      if (!isPasswordMatches) {
        return { error: "Invalid password" };
      }

      const hashedPassword = await bcrypt.hash(values.newPassword, 10);
      newValues.password = hashedPassword;
    }
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...newValues,
    },
  });

  return {
    success: "Settings updated!",
    error: undefined,
  };
};
