"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./card-wrapper";
import { LoginSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [loginSuccess, setLoginSuccess] = useState<string | undefined>(
    undefined
  );

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      login(values).then((res) => {
        setLoginError(res.error);
        setLoginSuccess(res.success);
      });
    });
  });

  return (
    <CardWrapper
      headelLabel='Welcome back'
      backButtonLabel="Don't have an account?"
      backButtonHref='/auth/register'
      showSocial
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => {
                return (
                  <FormItem>
                    {/* <FormLabel>Email</FormLabel> */}
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='Email'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage className='font-light' />
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
                    {/* <FormLabel>Password</FormLabel> */}
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder='Password'
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage className='font-light' />
                  </FormItem>
                );
              }}
            />
          </div>
          <FormError message={loginError} />
          <FormSuccess message={loginSuccess} />
          <Button
            type='submit'
            size='lg'
            className='w-full'
            disabled={isPending}
          >
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
