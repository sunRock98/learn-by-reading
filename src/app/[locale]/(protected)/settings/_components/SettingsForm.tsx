"use client";

import { updateUserSettings } from "@/actions/update-user-settings";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SettingsSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const SettingsForm = () => {
  const t = useTranslations("SettingsForm");
  const { update } = useSession();
  const user = useCurrentUser();

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const settingsSchema = SettingsSchema(t);
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: undefined,
      newPassword: undefined,
    },
  });

  const handleSubmit = async (values: z.infer<typeof settingsSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      updateUserSettings(values)
        .then(async (res) => {
          if (res?.error) {
            setError(res.error);
            return;
          }
          update();
          setSuccess(res?.success);
          form.setValue("password", "");
          form.setValue("newPassword", "");
        })
        .catch(() => {
          setError(t("errors.sthWentWrong"));
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>{t("schema.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      id='name'
                      type='text'
                      autoComplete='name'
                      {...field}
                      placeholder={t("schema.name.placeholder")}
                      className='mt-1 block w-full'
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage {...field} />
                </FormItem>
              );
            }}
          />
          {!user?.isOAuth && (
            <>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>{t("schema.email.label")}</FormLabel>
                      <FormControl>
                        <Input
                          id='email'
                          type='email'
                          autoComplete='email'
                          {...field}
                          placeholder={t("schema.email.placeholder")}
                          className='mt-1 block w-full'
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage {...field} />
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
                      <FormLabel>{t("schema.password.label")}</FormLabel>
                      <FormControl>
                        <Input
                          id='password'
                          // type='password'
                          autoComplete='password'
                          {...field}
                          placeholder='*******'
                          className='mt-1 block w-full'
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage {...field} />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>{t("schema.newPassword.label")}</FormLabel>
                      <FormControl>
                        <Input
                          id='newPassword'
                          // type='password'
                          autoComplete='password'
                          {...field}
                          placeholder='*******'
                          className='mt-1 block w-full'
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage {...field} />
                    </FormItem>
                  );
                }}
              />
            </>
          )}
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />
        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending}>
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
