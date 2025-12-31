"use client";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

import { Button } from "../ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export const Socials = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const t = useTranslations("common");

  const handleClick = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT });
  };
  return (
    <div className='grid w-full grid-cols-2 gap-4'>
      <Button
        onClick={() => handleClick("google")}
        variant='outline'
        className='w-full'
      >
        <FcGoogle className='h-5 w-5' />
        <span className='sr-only'>{t("loginWithGoogle")}</span>
      </Button>
      <Button
        onClick={() => handleClick("github")}
        variant='outline'
        className='w-full'
      >
        <FaGithub className='h-5 w-5' />
        <span className='sr-only'>{t("loginWithGitHub")}</span>
      </Button>
    </div>
  );
};
