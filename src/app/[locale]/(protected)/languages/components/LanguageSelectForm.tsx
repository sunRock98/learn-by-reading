"use client";

import { addUserLanguage } from "@/actions/add-user-language";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Language } from "@prisma/client";
import { useTranslations } from "next-intl";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  languages: Pick<Language, "code" | "id" | "name">[];
};

const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const LanguageSelectForm = ({ languages }: Props) => {
  const t = useTranslations("LanguageSelectForm");
  const tLevels = useTranslations("LanguageLevels");

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const languageSelectSchema = LanguageSchema(t);
  const form = useForm<z.infer<typeof languageSelectSchema>>({
    resolver: zodResolver(languageSelectSchema),
    defaultValues: {
      language: "",
      level: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof languageSelectSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      addUserLanguage(values)
        .then(async (res) => {
          if (res?.error) {
            setError(res.error);
            return;
          }

          form.reset();
        })
        .catch((e) => {
          console.error(e);
          setError(e.message);
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='language'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={""}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className='data-[placeholder]:text-slate-400'
                            placeholder={t("schema.language.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem
                            key={language.id}
                            value={String(language.id)}
                          >
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage {...field} />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name='level'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={""}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("schema.level.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {tLevels(level) + " - " + level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage {...field} />
                </FormItem>
              );
            }}
          />
          {/* {!user?.isOAuth && (
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
          )} */}
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
