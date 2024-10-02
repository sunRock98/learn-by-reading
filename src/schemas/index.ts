import { useTranslations } from "next-intl";
import * as z from "zod";

export const LoginSchema = (
  t: ReturnType<typeof useTranslations<"LoginForm">>
) =>
  z.object({
    email: z.string().email({ message: t("schema.email.required") }),
    password: z.string().min(1, { message: t("schema.password.required") }),
  });

export const RegisterSchema = (
  t: ReturnType<typeof useTranslations<"RegisterForm">>
) =>
  z.object({
    email: z.string().email({ message: t("schema.email.required") }),
    password: z.string().min(6, { message: t("schema.password.min") }),
    name: z.string().min(1, { message: t("schema.name.required") }),
  });

export const ResetSchema = (
  t: ReturnType<typeof useTranslations<"ResetForm">>
) =>
  z.object({
    email: z.string().email({ message: t("schema.email.required") }),
  });

export const NewPasswordSchema = (
  t: ReturnType<typeof useTranslations<"NewPasswordForm">>
) =>
  z.object({
    password: z.string().min(6, { message: t("schema.password.min") }),
  });

export const SettingsSchema = (
  t: ReturnType<typeof useTranslations<"SettingsForm">>
) =>
  z
    .object({
      name: z.optional(
        z.string().min(1, { message: t("schema.name.required") })
      ),
      email: z.optional(
        z.string().email({ message: t("schema.email.required") })
      ),
      password: z.optional(
        z.string().min(6, { message: t("schema.password.min") })
      ),
      newPassword: z.optional(
        z.string().min(6, { message: t("schema.newPassword.min") })
      ),
    })
    .refine(
      (data) => {
        if (data.newPassword && !data.password) {
          return false;
        }

        return true;
      },
      {
        message: t("schema.password.required"),
        path: ["password"],
      }
    )
    .refine(
      (data) => {
        if (data.password && !data.newPassword) {
          return false;
        }
        return true;
      },
      {
        message: t("schema.newPassword.required"),
        path: ["newPassword"],
      }
    );
