"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./card-wrapper";
import { RegisterSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { register } from "@/actions/register";
import { useState, useTransition, useEffect } from "react";
import { AUTH_ROUTES } from "@/routes";
import { useTranslations } from "next-intl";
import { getLanguageNameFromCode } from "@/lib/native-languages";

export const RegisterForm = () => {
  const t = useTranslations("RegisterForm");
  const [isPending, startTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [loginSuccess, setLoginSuccess] = useState<string | undefined>(
    undefined
  );
  const [browserLanguage, setBrowserLanguage] = useState<string>("English");
  const registerSchema = RegisterSchema(t);

  // Detect browser language on mount
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const browserLang = navigator.language || "en";
      const languageName = getLanguageNameFromCode(browserLang);
      setBrowserLanguage(languageName);
    }
  }, []);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      nativeLanguage: undefined,
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      // Include detected browser language
      register({ ...values, nativeLanguage: browserLanguage }).then((res) => {
        setLoginError(res.error);
        setLoginSuccess(res.success);
      });
    });
  });

  return (
    <CardWrapper
      headerLabel={t("headerLabel")}
      backButtonLabel={t("backButtonLabel")}
      backButtonHref={AUTH_ROUTES.LOGIN}
      showSocial
    >
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => {
                return (
                  <FormItem>
                    <div className='grid gap-2'>
                      <FormLabel htmlFor='name'>{t("nameLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id='name'
                          placeholder={t("namePlaceholder")}
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
                      <FormLabel htmlFor='password'>
                        {t("passwordLabel")}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          id='password'
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
            <FormError message={loginError} />
            <FormSuccess message={loginSuccess} />
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? t("creatingAccount") : t("registerButton")}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};
