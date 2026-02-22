import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SettingsForm } from "./_components/SettingsForm";
import { InterestsEditor } from "./_components/InterestsEditor";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const SettingsPage = async () => {
  const t = await getTranslations("SettingsPage");
  const tInterests = await getTranslations("InterestsEditor");
  const user = await getCurrentUser();

  const userData = user
    ? await db.user.findUnique({
        where: { id: user.id },
        select: { nativeLanguage: true, interests: true },
      })
    : null;

  return (
    <div className='mx-auto max-w-4xl space-y-6'>
      <Card className='border-indigo-100 bg-white/50 backdrop-blur dark:border-indigo-950 dark:bg-gray-900/50'>
        <CardHeader>
          <p className='text-center text-2xl font-semibold tracking-tight text-indigo-900 dark:text-indigo-100'>
            {t("headerLabel")}
          </p>
        </CardHeader>
        <CardContent>
          <SettingsForm
            initialNativeLanguage={userData?.nativeLanguage ?? "English"}
          />
        </CardContent>
      </Card>

      <Card className='border-indigo-100 bg-white/50 backdrop-blur dark:border-indigo-950 dark:bg-gray-900/50'>
        <CardHeader>
          <p className='text-center text-xl font-semibold tracking-tight text-indigo-900 dark:text-indigo-100'>
            {tInterests("title")}
          </p>
        </CardHeader>
        <CardContent>
          <InterestsEditor initialInterests={userData?.interests ?? []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
