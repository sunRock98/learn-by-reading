"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Socials } from "./social-wrapper";
import { BookOpen } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Props = {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  description?: string;
};
export const CardWrapper = ({
  children,
  headerLabel,
  backButtonHref,
  backButtonLabel,
  showSocial,
  description,
}: Props) => {
  const tLogin = useTranslations("LoginForm");
  const tRegister = useTranslations("RegisterForm");
  const tReset = useTranslations("ResetForm");
  const tCommon = useTranslations("common");

  // Determine which page we're on based on back button href
  // Login page links to register, Register page links to login
  const isLoginPage = backButtonHref.includes("register");
  const isRegisterPage = backButtonHref.includes("login") && showSocial;
  const isResetPage = backButtonHref.includes("login") && !showSocial;

  const getDescription = () => {
    if (description !== undefined) return description;
    if (isLoginPage) return tLogin("description");
    if (isRegisterPage) return tRegister("description");
    if (isResetPage) return tReset("description");
    return "";
  };

  const getBottomText = () => {
    if (isLoginPage) return tLogin("noAccount");
    if (isRegisterPage) return tRegister("hasAccount");
    return null; // Reset page just shows link
  };

  return (
    <div className='w-full max-w-sm'>
      <div className='flex flex-col gap-6'>
        <div className='mb-4 flex items-center justify-center gap-2'>
          <BookOpen className='text-primary h-8 w-8' />
          <span className='text-2xl font-bold'>Read2Learn</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>{headerLabel}</CardTitle>
            {getDescription() && (
              <CardDescription>{getDescription()}</CardDescription>
            )}
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            {children}
            {showSocial && (
              <>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-card text-muted-foreground px-2'>
                      {tCommon("orContinueWith")}
                    </span>
                  </div>
                </div>
                <Socials />
              </>
            )}
            <div className='text-center text-sm'>
              {getBottomText() ? (
                <>
                  {getBottomText()}{" "}
                  <Link
                    href={backButtonHref}
                    className='underline underline-offset-4'
                  >
                    {backButtonLabel}
                  </Link>
                </>
              ) : (
                <Link
                  href={backButtonHref}
                  className='underline underline-offset-4'
                >
                  {backButtonLabel}
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
