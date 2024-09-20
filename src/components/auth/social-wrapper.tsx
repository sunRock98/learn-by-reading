"use client";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

import { Button } from "../ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useSearchParams } from "next/navigation";

export const Socials = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleClick = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT });
  };
  return (
    <div className='flex w-full items-center gap-x-2'>
      <Button
        onClick={() => handleClick("google")}
        size={"lg"}
        className='w-full'
        variant='outline'
      >
        <FcGoogle className='h-5 w-5' />
      </Button>
      <Button
        onClick={() => handleClick("github")}
        size={"lg"}
        className='w-full'
        variant='outline'
      >
        <FaGithub className='h-5 w-5' />
      </Button>
    </div>
  );
};
