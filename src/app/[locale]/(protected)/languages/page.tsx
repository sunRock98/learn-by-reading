"use server";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LanguageSelectForm } from "./components/LanguageSelectForm";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { UserLanguageItem } from "./components/UserLanguageItem";

const getLanguages = async () => {
  return await db.language.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
};

const getUserLanguages = async () => {
  const user = await getCurrentUser();

  return await db.userLanguage.findMany({
    where: {
      userId: user?.id,
    },
    select: {
      id: true,
      language: {
        select: {
          name: true,
        },
      },
      level: true,
    },
  });
};

const LanguageSettingPage = async () => {
  const t = await getTranslations("LanguageSettingPage");
  const languages = await getLanguages();
  const userLanguages = await getUserLanguages();

  return (
    <Card className='mx-auto max-w-4xl border-indigo-100 bg-white/50 backdrop-blur dark:border-indigo-950 dark:bg-gray-900/50'>
      <CardHeader>
        <p className='text-center text-2xl font-semibold tracking-tight text-indigo-900 dark:text-indigo-100'>
          {t("headerLabel")}
        </p>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-indigo-800'>
            {t("yourLanguage")}
          </h3>
          <div className='mb-2 grid gap-3'>
            {userLanguages.map((userLanguage) => {
              return (
                <UserLanguageItem
                  key={userLanguage.id}
                  userLanguage={userLanguage}
                />
              );
            })}
          </div>
          <LanguageSelectForm languages={languages ?? []} />
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingPage;
