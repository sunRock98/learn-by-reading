"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Socials } from "./social-wrapper";
import { BookOpen } from "lucide-react";
import { Link } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};
export const CardWrapper = ({
  children,
  headerLabel,
  backButtonHref,
  backButtonLabel,
  showSocial,
}: Props) => {
  const isLoginPage = backButtonHref.includes("sign-up");
  
  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl">Read2Learn</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{headerLabel}</CardTitle>
            <CardDescription>
              {isLoginPage 
                ? "Enter your email below to login to your account"
                : "Enter your information to create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {children}
            {showSocial && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Socials />
              </>
            )}
            <div className="text-center text-sm">
              {isLoginPage ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link href={backButtonHref} className="underline underline-offset-4">
                    {backButtonLabel}
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href={backButtonHref} className="underline underline-offset-4">
                    {backButtonLabel}
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
