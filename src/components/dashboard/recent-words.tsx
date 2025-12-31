"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Word {
  id: number;
  original: string;
  translation: string;
  masteryLevel: string;
  languageFrom: { name: string };
  languageTo: { name: string };
}

interface RecentWordsProps {
  words: Word[];
}

export function RecentWords({ words }: RecentWordsProps) {
  const t = useTranslations("RecentWords");
  const tDict = useTranslations("Dictionary");

  const getMasteryColor = (level: string) => {
    switch (level) {
      case "LEARNING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "REVIEWING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "MASTERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      default:
        return "";
    }
  };

  const getMasteryLabel = (level: string) => {
    switch (level) {
      case "LEARNING":
        return tDict("learning");
      case "REVIEWING":
        return tDict("reviewing");
      case "MASTERED":
        return tDict("mastered");
      default:
        return level;
    }
  };

  if (words.length === 0) {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>{t("title")}</h2>
        </div>
        <Card className='p-8'>
          <div className='flex flex-col items-center justify-center text-center'>
            <BookOpen className='text-muted-foreground mb-3 h-10 w-10' />
            <h3 className='mb-1 text-sm font-semibold'>{t("noWords")}</h3>
            <p className='text-muted-foreground text-xs'>
              {t("noWordsDescription")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>{t("title")}</h2>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/dictionary'>
            {t("viewAll")}
            <ArrowRight className='ml-1 h-4 w-4' />
          </Link>
        </Button>
      </div>

      <Card className='divide-y'>
        {words.map((word) => (
          <div key={word.id} className='p-4'>
            <div className='mb-1 flex items-center justify-between'>
              <span className='font-semibold'>{word.original}</span>
              <Badge
                className={`text-xs ${getMasteryColor(word.masteryLevel)}`}
              >
                {getMasteryLabel(word.masteryLevel)}
              </Badge>
            </div>
            <p className='text-muted-foreground text-sm'>{word.translation}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
