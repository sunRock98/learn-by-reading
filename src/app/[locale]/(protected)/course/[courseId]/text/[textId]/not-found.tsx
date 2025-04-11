import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { BackButton } from "@/components/auth/back-button";

export default function NotFound() {
  const t = useTranslations("TextNotFound");

  return (
    <Card className='mx-auto max-w-md border-red-100 bg-white/50 backdrop-blur dark:border-red-950 dark:bg-gray-900/50'>
      <CardHeader>
        <h2 className='text-center text-2xl font-semibold tracking-tight text-red-600'>
          {t("title") || "Text Not Found"}
        </h2>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-4'>
        <p className='text-center text-gray-600 dark:text-gray-300'>
          {t("message") ||
            "The text you are looking for does not exist or has been removed."}
        </p>
        <BackButton label={t("backHome") || "Go Back"} href='/' />
      </CardContent>
    </Card>
  );
}
