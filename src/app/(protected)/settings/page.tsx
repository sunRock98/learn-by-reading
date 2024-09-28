"use client";

import { updateUserSettings } from "@/actions/update-user-settings";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SettingsPage = () => {
  const { update } = useSession();
  const user = useCurrentUser();

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: undefined,
      newPassword: undefined,
    },
  });

  const handleSubmit = async (values: z.infer<typeof SettingsSchema>) => {
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
          setError("Something went wrong!");
        });
    });
  };

  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-center text-2xl font-semibold'>⚙︎ Settings</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          id='name'
                          type='text'
                          autoComplete='name'
                          {...field}
                          placeholder='Name'
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              id='email'
                              type='email'
                              autoComplete='email'
                              {...field}
                              placeholder='Email'
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
                          <FormLabel>Password</FormLabel>
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
                          <FormLabel>New Password</FormLabel>
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
                Save
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
