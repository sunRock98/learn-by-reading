"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./card-wrapper";
import { LoginSchema } from "@/schemas";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { AUTH_ROUTES } from "@/routes";
import { Link } from "@/i18n/routing";

export const LoginForm = () => {
  const t = useTranslations("LoginForm");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl");
  const errorParamText =
    errorParam === "OAuthAccountNotLinked"
      ? t("errors.oauthAccountNotLinked")
      : "";
  const loginSchema = LoginSchema(t);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      login(values, callbackUrl).then((res) => {
        setError(res?.error);
        setSuccess(res?.success);
      });
    });
  });

  return (
    <CardWrapper
      headerLabel={t("headerLabel")}
      backButtonLabel={t("backButtonLabel")}
      backButtonHref={AUTH_ROUTES.REGISTER}
      showSocial
    >
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => {
                return (
                  <FormItem>
                    <div className='grid gap-2'>
                      <FormLabel htmlFor='email'>{t("emailLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id='email'
                          type='email'
                          placeholder={t("emailPlaceholder")}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage className='font-light' />
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => {
                return (
                  <FormItem>
                    <div className='grid gap-2'>
                      <div className='flex items-center justify-between'>
                        <FormLabel htmlFor='password'>
                          {t("passwordLabel")}
                        </FormLabel>
                        <Button
                          size={"sm"}
                          variant={"link"}
                          asChild
                          className='h-auto px-0 font-normal'
                        >
                          <Link href={AUTH_ROUTES.RESET}>
                            {t("forgotPassword")}
                          </Link>
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          id='password'
                          type='password'
                          placeholder={t("passwordPlaceholder")}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage className='font-light' />
                    </div>
                  </FormItem>
                );
              }}
            />
            <FormError message={error || errorParamText} />
            <FormSuccess message={success} />
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? t("loggingIn") : t("loginButton")}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};
