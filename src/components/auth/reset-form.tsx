"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./card-wrapper";
import { ResetSchema } from "@/schemas";
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
import { useState, useTransition } from "react";
import { AUTH_ROUTES } from "@/routes";
import { reset } from "@/actions/reset";
import { useTranslations } from "next-intl";

export const ResetForm = () => {
  const t = useTranslations("ResetForm");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  const resetSchema = ResetSchema(t);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      reset(values).then((res) => {
        setError(res?.error);
        setSuccess(res?.success);
      });
    });
  });

  return (
    <CardWrapper
      headerLabel={t("headerLabel")}
      backButtonLabel={t("backButtonLabel")}
      backButtonHref={AUTH_ROUTES.LOGIN}
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
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder={t("emailPlaceholder")}
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
            disabled={isPending}
          >
            {t("resetButton")}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
