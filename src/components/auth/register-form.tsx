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
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { register } from "@/actions/register";
import { useState, useTransition } from "react";
import { AUTH_ROUTES } from "@/routes";
import { useTranslations } from "next-intl";

export const RegisterForm = () => {
  const t = useTranslations("RegisterForm");
  const [isPending, startTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [loginSuccess, setLoginSuccess] = useState<string | undefined>(
    undefined
  );
  const registerSchema = RegisterSchema(t);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      register(values).then((res) => {
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
                      <FormLabel htmlFor='name'>Name</FormLabel>
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
                      <FormLabel htmlFor='email'>Email</FormLabel>
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
                      <FormLabel htmlFor='password'>Password</FormLabel>
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
            <FormError message={loginError} />
            <FormSuccess message={loginSuccess} />
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? "Creating account..." : t("registerButton")}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};
