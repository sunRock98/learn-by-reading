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
    return null;
  };

  return (
    <div className='w-full max-w-sm'>
      <div className='flex flex-col gap-6'>
        {/* Animated Logo */}
        <div className='mb-2 flex items-center justify-center gap-2.5'>
          <div className='gradient-bg flex h-10 w-10 items-center justify-center rounded-xl shadow-lg'>
            <BookOpen className='h-6 w-6 text-white' />
          </div>
          <span className='text-2xl font-bold tracking-tight'>Read2Learn</span>
        </div>

        <Card className='border-border/50 shadow-lg'>
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
                    <span className='border-border/50 w-full border-t' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-card text-muted-foreground px-3'>
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
                  <span className='text-muted-foreground'>
                    {getBottomText()}
                  </span>{" "}
                  <Link
                    href={backButtonHref}
                    className='text-primary font-medium underline-offset-4 transition-colors hover:underline'
                  >
                    {backButtonLabel}
                  </Link>
                </>
              ) : (
                <Link
                  href={backButtonHref}
                  className='text-primary font-medium underline-offset-4 transition-colors hover:underline'
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
