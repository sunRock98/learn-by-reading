"use client";

import { z } from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { NewPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePassword } from "@/actions/change-password";
import { useSearchParams } from "next/navigation";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      changePassword(values, searchParams.get("token")).then((res) => {
        if (res?.error) {
          setError(res.error);
        }

        setSuccess(res?.success);
      });
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      placeholder='********'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className='font-light' />
                </FormItem>
              );
            }}
          />
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          type='submit'
          size='lg'
          className='w-full'
          disabled={isPending || !!success}
        >
          Change password
        </Button>
      </form>
    </Form>
  );
};
