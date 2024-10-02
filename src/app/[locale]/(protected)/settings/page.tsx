"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SettingsForm } from "../_components/SettingsForm";
import { useTranslations } from "next-intl";

const SettingsPage = () => {
  const t = useTranslations("SettingsPage");
  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-center text-2xl font-semibold'>
          ⚙︎ {t("headerLabel")}
        </p>
      </CardHeader>
      <CardContent>
        <SettingsForm />
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
