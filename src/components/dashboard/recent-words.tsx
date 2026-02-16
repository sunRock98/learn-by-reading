"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Volume2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

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

const MASTERY_CONFIG: Record<string, { class: string; dot: string }> = {
  LEARNING: {
    class:
      "bg-[oklch(0.93_0.06_75)] text-[oklch(0.42_0.1_75)] dark:bg-[oklch(0.25_0.04_75)] dark:text-[oklch(0.82_0.07_75)]",
    dot: "bg-[oklch(0.72_0.13_75)]",
  },
  REVIEWING: {
    class:
      "bg-[oklch(0.93_0.04_255)] text-[oklch(0.4_0.1_255)] dark:bg-[oklch(0.25_0.03_255)] dark:text-[oklch(0.82_0.08_255)]",
    dot: "bg-[oklch(0.55_0.14_255)]",
  },
  MASTERED: {
    class:
      "bg-[oklch(0.93_0.05_175)] text-[oklch(0.35_0.1_175)] dark:bg-[oklch(0.25_0.04_175)] dark:text-[oklch(0.8_0.1_175)]",
    dot: "bg-[oklch(0.58_0.14_175)]",
  },
};

export function RecentWords({ words }: RecentWordsProps) {
  const t = useTranslations("RecentWords");
  const tDict = useTranslations("Dictionary");

  const getMasteryConfig = (level: string) => {
    return MASTERY_CONFIG[level] || MASTERY_CONFIG.LEARNING;
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

  const handlePlayAudio = useCallback((word: string, languageName: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      const voices = speechSynthesis.getVoices();
      const langCode = languageName.toLowerCase().slice(0, 2);
      const voice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langCode)
      );
      if (voice) utterance.voice = voice;
      speechSynthesis.speak(utterance);
    }
  }, []);

  if (words.length === 0) {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>{t("title")}</h2>
        </div>
        <div className='border-border bg-card/50 rounded-2xl border border-dashed p-8'>
          <div className='flex flex-col items-center justify-center text-center'>
            <div className='bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-xl'>
              <BookOpen className='text-primary h-5 w-5' />
            </div>
            <h3 className='mb-1 text-sm font-semibold'>{t("noWords")}</h3>
            <p className='text-muted-foreground text-xs'>
              {t("noWordsDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>{t("title")}</h2>
        <Button variant='ghost' size='sm' asChild className='group'>
          <Link href='/dictionary'>
            {t("viewAll")}
            <ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5' />
          </Link>
        </Button>
      </div>

      <div className='border-border/50 bg-card overflow-hidden rounded-2xl border'>
        {words.map((word, index) => {
          const config = getMasteryConfig(word.masteryLevel);
          return (
            <div
              key={word.id}
              className={`hover:bg-muted/30 group flex items-center justify-between p-4 transition-colors ${index !== words.length - 1 ? "border-border/30 border-b" : ""}`}
            >
              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <span className='font-semibold'>{word.original}</span>
                  <button
                    onClick={() =>
                      handlePlayAudio(word.original, word.languageFrom.name)
                    }
                    className='text-muted-foreground hover:text-primary rounded-full p-0.5 opacity-0 transition-all group-hover:opacity-100'
                  >
                    <Volume2 className='h-3.5 w-3.5' />
                  </button>
                </div>
                <p className='text-muted-foreground text-sm'>
                  {word.translation}
                </p>
              </div>
              <Badge className={`rounded-full text-xs ${config.class}`}>
                <span
                  className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${config.dot}`}
                />
                {getMasteryLabel(word.masteryLevel)}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
