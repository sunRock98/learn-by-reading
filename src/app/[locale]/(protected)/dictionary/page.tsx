import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserDictionaryWordsByLanguage } from "@/actions/dictionary";
import { DictionaryTabs } from "@/components/dictionary-tabs";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function DictionaryTabsSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='mb-6 flex gap-2'>
        <div className='h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-800' />
        <div className='h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-800' />
        <div className='h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-800' />
      </div>
      <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='h-24 rounded-lg bg-gray-200 dark:bg-gray-800'
          />
        ))}
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='h-48 rounded-lg bg-gray-200 dark:bg-gray-800'
          />
        ))}
      </div>
    </div>
  );
}

async function DictionaryContent() {
  const { groups, activeLanguageId } = await getUserDictionaryWordsByLanguage();

  return <DictionaryTabs groups={groups} activeLanguageId={activeLanguageId} />;
}

export default async function DictionaryPage() {
  const user = await getCurrentUser();
  const t = await getTranslations("Dictionary");
  const tBack = await getTranslations("BackButton");

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className='container mx-auto max-w-6xl px-4 py-8'>
      <Button variant='ghost' size='sm' asChild className='mb-4'>
        <Link href='/dashboard'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {tBack("backToDashboard")}
        </Link>
      </Button>

      <div className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold'>{t("title")}</h1>
        <p className='text-muted-foreground text-lg'>{t("subtitle")}</p>
      </div>

      <Suspense fallback={<DictionaryTabsSkeleton />}>
        <DictionaryContent />
      </Suspense>
    </div>
  );
}
