import { AUTH_ROUTES } from "@/routes";
import { Resend } from "resend";

const resend = new Resend();

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name: string
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_SITE_URL}${AUTH_ROUTES.VERIFY_EMAIL}?token=${token}`;

  return await resend.emails.send({
    to: email,
    from: "onboarding@resend.dev",
    subject: "Verify your email",
    html: `<p>Nice to have you aboard, ${name}! <br /> <a href="${confirmLink}">Click here to verify your email</a></p>`,
  });
};

export const sendResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}${AUTH_ROUTES.NEW_PASSWORD}?token=${token}`;

  return await resend.emails.send({
    to: email,
    from: "onboarding@resend.dev",
    subject: "Reset your password",
    html: `<p>Reset your password by <a href="${resetLink}">clicking this link</a></p>`,
  });
};
