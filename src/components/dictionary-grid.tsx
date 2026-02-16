"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Volume2, Trash2, Star, Search, BookOpen } from "lucide-react";
import {
  removeWordFromDictionary,
  updateWordMastery,
} from "@/actions/dictionary";
import { MasteryLevel } from "@prisma/client";
import { useTranslations } from "next-intl";

interface Word {
  id: number;
  original: string;
  translation: string;
  lookupCount: number;
  lastSeenAt: Date;
  masteryLevel: MasteryLevel;
  createdAt: Date;
  languageFrom: { name: string };
  languageTo: { name: string };
  dictionary: {
    course: {
      language: { name: string };
      level: { name: string };
    };
  };
}

interface DictionaryGridProps {
  words: Word[];
}

const MASTERY_STYLES: Record<string, { badge: string; dot: string }> = {
  LEARNING: {
    badge:
      "bg-[oklch(0.93_0.06_75)] text-[oklch(0.42_0.1_75)] dark:bg-[oklch(0.25_0.04_75)] dark:text-[oklch(0.82_0.07_75)]",
    dot: "bg-[oklch(0.72_0.13_75)]",
  },
  REVIEWING: {
    badge:
      "bg-[oklch(0.93_0.04_255)] text-[oklch(0.4_0.1_255)] dark:bg-[oklch(0.25_0.03_255)] dark:text-[oklch(0.82_0.08_255)]",
    dot: "bg-[oklch(0.55_0.14_255)]",
  },
  MASTERED: {
    badge:
      "bg-[oklch(0.93_0.05_175)] text-[oklch(0.35_0.1_175)] dark:bg-[oklch(0.25_0.04_175)] dark:text-[oklch(0.8_0.1_175)]",
    dot: "bg-[oklch(0.58_0.14_175)]",
  },
};

export function DictionaryGrid({ words: initialWords }: DictionaryGridProps) {
  const [words, setWords] = useState(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<MasteryLevel | "all">("all");
  const t = useTranslations("Dictionary");
  const tCommon = useTranslations("common");

  const filteredWords = words.filter((word) => {
    const matchesSearch =
      word.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || word.masteryLevel === filter;
    return matchesSearch && matchesFilter;
  });

  const handlePlayAudio = useCallback((word: string, language: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      const langCode = language.toLowerCase().slice(0, 2);
      const voices = speechSynthesis.getVoices();
      const voice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langCode)
      );
      if (voice) {
        utterance.voice = voice;
      }
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleToggleMastered = useCallback(
    async (id: number, currentLevel: MasteryLevel) => {
      const newLevel =
        currentLevel === MasteryLevel.MASTERED
          ? MasteryLevel.LEARNING
          : MasteryLevel.MASTERED;

      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, masteryLevel: newLevel } : w))
      );

      await updateWordMastery({ wordId: id, masteryLevel: newLevel });
    },
    []
  );

  const handleDelete = useCallback(async (id: number) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    await removeWordFromDictionary({ wordId: id });
  }, []);

  const getMasteryStyle = (level: MasteryLevel) => {
    return MASTERY_STYLES[level] || MASTERY_STYLES.LEARNING;
  };

  const getMasteryLabel = (level: MasteryLevel) => {
    switch (level) {
      case MasteryLevel.LEARNING:
        return t("learning");
      case MasteryLevel.REVIEWING:
        return t("reviewing");
      case MasteryLevel.MASTERED:
        return t("mastered");
      default:
        return level;
    }
  };

  if (words.length === 0) {
    return (
      <div className='border-border bg-card/50 relative overflow-hidden rounded-2xl border border-dashed p-12'>
        <div className='bg-linear-to-br from-primary/3 absolute inset-0 to-transparent' />
        <div className='relative flex flex-col items-center justify-center text-center'>
          <div className='gradient-bg animate-bounce-subtle mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg'>
            <BookOpen className='h-7 w-7 text-white' />
          </div>
          <h3 className='mb-2 text-lg font-bold'>{t("noWords")}</h3>
          <p className='text-muted-foreground max-w-md'>
            {t("noWordsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and filter */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='rounded-xl pl-10'
          />
        </div>
        <div className='flex gap-2'>
          {(
            [
              ["all", tCommon("all")],
              [MasteryLevel.LEARNING, t("learning")],
              [MasteryLevel.REVIEWING, t("reviewing")],
              [MasteryLevel.MASTERED, t("mastered")],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              size='sm'
              onClick={() => setFilter(value as MasteryLevel | "all")}
              className={
                filter === value ? "gradient-bg border-0 text-white" : ""
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>
          {filteredWords.length} {tCommon("words")}
          {filter !== "all" && ` (${getMasteryLabel(filter as MasteryLevel)})`}
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredWords.map((word, index) => {
          const style = getMasteryStyle(word.masteryLevel);
          return (
            <div
              key={word.id}
              className='card-hover card-shine border-border/50 bg-card group relative overflow-hidden rounded-2xl border p-5'
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <h3 className='text-xl font-bold'>{word.original}</h3>
                    {word.masteryLevel === MasteryLevel.MASTERED && (
                      <Star className='h-4 w-4 fill-[oklch(0.72_0.13_75)] text-[oklch(0.72_0.13_75)]' />
                    )}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={() =>
                    handleToggleMastered(word.id, word.masteryLevel)
                  }
                  className='rounded-full'
                >
                  <Star
                    className={`h-4 w-4 ${word.masteryLevel === MasteryLevel.MASTERED ? "fill-[oklch(0.72_0.13_75)] text-[oklch(0.72_0.13_75)]" : ""}`}
                  />
                </Button>
              </div>

              <div className='mb-4 space-y-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge className={`rounded-full ${style.badge}`}>
                    <span
                      className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${style.dot}`}
                    />
                    {getMasteryLabel(word.masteryLevel)}
                  </Badge>
                  <Badge variant='secondary' className='rounded-full'>
                    {word.dictionary.course.language.name}
                  </Badge>
                </div>

                <p className='gradient-text text-lg font-bold'>
                  {word.translation}
                </p>

                <div className='text-muted-foreground flex items-center justify-between text-xs'>
                  <span>{t("lookedUp", { count: word.lookupCount })}</span>
                  <span>
                    {t("added", {
                      date: new Date(word.createdAt).toLocaleDateString(),
                    })}
                  </span>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    handlePlayAudio(word.original, word.languageFrom.name)
                  }
                  className='flex-1 rounded-xl'
                >
                  <Volume2 className='mr-2 h-4 w-4' />
                  {tCommon("listen")}
                </Button>
                <Button
                  variant='outline'
                  size='icon-sm'
                  onClick={() => handleDelete(word.id)}
                  className='text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
