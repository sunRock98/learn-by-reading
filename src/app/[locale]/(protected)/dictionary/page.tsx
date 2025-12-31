import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserDictionaryWords } from "@/actions/dictionary";
import { DictionaryGrid } from "@/components/dictionary-grid";
import { DictionaryStats } from "@/components/dictionary-stats";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function DictionaryPage() {
  const user = await getCurrentUser();
  const t = await getTranslations("Dictionary");
  const tBack = await getTranslations("BackButton");

  if (!user) {
    redirect("/auth/login");
  }

  const { words } = await getUserDictionaryWords();

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

      <DictionaryStats words={words} />
      <DictionaryGrid words={words} />
    </div>
  );
}
