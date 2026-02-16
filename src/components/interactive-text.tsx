"use client";

import type React from "react";
import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { TranslationPopup } from "@/components/translation-popup";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Headphones, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { AudioReader } from "@/components/audio-reader";
import { useTranslations } from "next-intl";
import { updateWordMasteryOnTextComplete } from "@/actions/dictionary";
import { markTextAsComplete } from "@/actions/text-progress";
import { cn } from "@/lib/utils";
import { MasteryLevel } from "@prisma/client";

interface Text {
  id: number;
  title: string;
  content: string;
  courseId: number;
  pictureUrl?: string | null;
}

interface Course {
  language: {
    name: string;
  };
  level: {
    name: string;
  };
}

interface DictionaryWord {
  original: string;
  masteryLevel: MasteryLevel;
}

interface InteractiveTextProps {
  text: Text;
  course: Course;
  userNativeLanguage: string;
  dictionaryWords?: DictionaryWord[];
  isCompleted?: boolean;
}

interface WordPosition {
  word: string;
  x: number;
  y: number;
}

type ViewMode = "read" | "listen";

export function InteractiveText({
  text,
  course,
  userNativeLanguage,
  dictionaryWords = [],
  isCompleted = false,
}: InteractiveTextProps) {
  const [selectedWord, setSelectedWord] = useState<WordPosition | null>(null);
  const [completedReading, setCompletedReading] = useState(isCompleted);
  const [justCompleted, setJustCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("read");
  const router = useRouter();
  const t = useTranslations("InteractiveText");

  const dictionaryMap = useMemo(() => {
    const map = new Map<string, MasteryLevel>();
    for (const word of dictionaryWords) {
      map.set(word.original.toLowerCase(), word.masteryLevel);
    }
    return map;
  }, [dictionaryWords]);

  const handleWordClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const target = e.currentTarget;
      const word = target.textContent || "";
      const rect = target.getBoundingClientRect();

      const cleanedWord = word
        .toLowerCase()
        .replace(/[.,!?;:'"()]/g, "")
        .trim();

      if (cleanedWord.length === 0) return;

      setSelectedWord({
        word: cleanedWord,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    },
    []
  );

  const handleClosePopup = useCallback(() => {
    setSelectedWord(null);
  }, []);

  const handleCompleteReading = useCallback(async () => {
    await updateWordMasteryOnTextComplete(text.id);
    await markTextAsComplete(text.id, text.courseId);
    setCompletedReading(true);
    setJustCompleted(true);
    setTimeout(() => {
      router.push(`/course/${text.courseId}`);
    }, 2000);
  }, [router, text.courseId, text.id]);

  const renderInteractiveText = useCallback(
    (content: string) => {
      const words = content.split(/(\s+)/);

      return words.map((word, index) => {
        if (word.trim() === "") {
          return <span key={index}>{word}</span>;
        }

        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(word);

        if (!hasLetters) {
          return <span key={index}>{word}</span>;
        }

        const cleanedWord = word
          .toLowerCase()
          .replace(/[.,!?;:'"()«»—–]/g, "")
          .trim();
        const masteryLevel = dictionaryMap.get(cleanedWord);

        const masteryClass = masteryLevel
          ? cn(
              masteryLevel === MasteryLevel.LEARNING && "mastery-learning",
              masteryLevel === MasteryLevel.REVIEWING && "mastery-reviewing",
              masteryLevel === MasteryLevel.MASTERED && "mastery-mastered"
            )
          : "";

        return (
          <span
            key={index}
            onClick={handleWordClick}
            className={cn("word-clickable", masteryClass)}
            role='button'
            tabIndex={0}
            title={
              masteryLevel
                ? `${masteryLevel === MasteryLevel.LEARNING ? "Learning" : masteryLevel === MasteryLevel.REVIEWING ? "Reviewing" : "Mastered"}`
                : undefined
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleWordClick(
                  e as unknown as React.MouseEvent<HTMLSpanElement>
                );
              }
            }}
          >
            {word}
          </span>
        );
      });
    },
    [handleWordClick, dictionaryMap]
  );

  return (
    <div className='animate-fade-in'>
      {/* Magazine Style Card */}
      <div className='border-border/50 bg-card mb-6 overflow-hidden rounded-2xl border shadow-xl'>
        {/* Hero Section */}
        <div
          className={`grid min-h-[400px] ${text.pictureUrl ? "md:grid-cols-2" : "grid-cols-1"}`}
        >
          {/* Left - Title & Info */}
          <div className='flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16'>
            {/* Category Tag */}
            <div className='mb-6 flex items-center gap-2'>
              <span className='bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-serif text-xs font-semibold uppercase tracking-widest'>
                <Sparkles className='h-3 w-3' />
                {course.language.name} · {course.level.name}
              </span>
            </div>

            {/* Title */}
            <h1 className='mb-6 font-serif text-3xl font-bold leading-[1.15] tracking-tight md:text-4xl lg:text-5xl'>
              {text.title}
            </h1>

            {/* Subtitle */}
            <p className='text-muted-foreground mb-8 font-serif text-lg italic'>
              {t("clickToTranslate")}
            </p>

            {/* Mode Toggle */}
            <div className='flex gap-3'>
              <Button
                variant={viewMode === "read" ? "default" : "outline"}
                size='sm'
                onClick={() => setViewMode("read")}
                className={cn(
                  "gap-2 font-serif",
                  viewMode === "read" &&
                    "gradient-bg border-0 text-white shadow-md"
                )}
              >
                <BookOpen className='h-4 w-4' />
                {t("read")}
              </Button>
              <Button
                variant={viewMode === "listen" ? "default" : "outline"}
                size='sm'
                onClick={() => setViewMode("listen")}
                className={cn(
                  "gap-2 font-serif",
                  viewMode === "listen" &&
                    "gradient-bg border-0 text-white shadow-md"
                )}
              >
                <Headphones className='h-4 w-4' />
                {t("listen")}
              </Button>
            </div>
          </div>

          {/* Right - Image */}
          {text.pictureUrl && (
            <div className='relative min-h-[300px] md:min-h-full'>
              <Image
                src={text.pictureUrl}
                alt={`${t("clickToTranslate")} - ${text.title}`}
                fill
                className='object-cover transition-transform duration-700 hover:scale-105'
                sizes='(max-width: 768px) 100vw, 50vw'
                priority
              />
              <div className='bg-linear-to-l to-card/10 absolute inset-0 from-transparent' />
              <div className='bg-linear-to-t from-card/30 absolute inset-0 to-transparent md:hidden' />
            </div>
          )}
        </div>

        {/* Elegant Divider */}
        <div className='flex items-center justify-center gap-4 px-8 py-5'>
          <div className='bg-linear-to-r via-border h-px flex-1 from-transparent to-transparent' />
          <div className='gradient-bg h-2 w-2 rotate-45 rounded-[1px]' />
          <div className='bg-linear-to-r via-border h-px flex-1 from-transparent to-transparent' />
        </div>

        {/* Content */}
        <div className='px-8 pb-8 md:px-12 lg:px-16'>
          {viewMode === "read" && (
            <div className='mx-auto max-w-2xl'>
              <div className='text-foreground font-serif text-lg leading-[1.95]'>
                <div className='whitespace-pre-line'>
                  {renderInteractiveText(text.content)}
                </div>
              </div>
            </div>
          )}

          {viewMode === "listen" && (
            <div className='mx-auto max-w-2xl'>
              <AudioReader
                text={text.content}
                language={course.language.name}
              />
            </div>
          )}
        </div>

        {/* Magazine Footer */}
        <div className='border-border/50 bg-muted/30 border-t px-8 py-4'>
          <div className='text-muted-foreground flex items-center justify-center gap-2 font-serif text-xs uppercase tracking-[0.2em]'>
            <span className='gradient-text'>◆</span>
            <span>Read2Learn</span>
            <span className='gradient-text'>◆</span>
          </div>
        </div>
      </div>

      {/* Action / Status */}
      {!completedReading ? (
        <div className='flex justify-center'>
          <Button
            onClick={handleCompleteReading}
            size='lg'
            className='gradient-bg group h-12 border-0 px-8 text-white shadow-lg hover:shadow-xl hover:brightness-110'
          >
            <CheckCircle2 className='mr-2 h-5 w-5' />
            {t("markComplete")}
          </Button>
        </div>
      ) : isCompleted && !justCompleted ? (
        <div className='animate-fade-in rounded-2xl border border-[oklch(0.7_0.14_175/0.3)] bg-[oklch(0.95_0.03_175)] p-6 dark:border-[oklch(0.4_0.08_175/0.3)] dark:bg-[oklch(0.2_0.02_175)]'>
          <div className='flex items-center gap-3 text-[oklch(0.35_0.12_175)] dark:text-[oklch(0.78_0.1_175)]'>
            <CheckCircle2 className='h-6 w-6' />
            <p className='font-semibold'>{t("alreadyCompleted")}</p>
          </div>
        </div>
      ) : (
        <div className='animate-scale-in rounded-2xl border border-[oklch(0.7_0.14_175/0.3)] bg-[oklch(0.95_0.03_175)] p-6 dark:border-[oklch(0.4_0.08_175/0.3)] dark:bg-[oklch(0.2_0.02_175)]'>
          <div className='flex items-center gap-3 text-[oklch(0.35_0.12_175)] dark:text-[oklch(0.78_0.1_175)]'>
            <CheckCircle2 className='h-6 w-6' />
            <div>
              <p className='font-semibold'>{t("greatJob")}</p>
              <p className='text-sm opacity-80'>{t("returningToCourse")}</p>
            </div>
          </div>
        </div>
      )}

      {selectedWord && viewMode === "read" && (
        <TranslationPopup
          word={selectedWord.word}
          sourceLanguage={course.language.name}
          targetLanguage={userNativeLanguage}
          position={{ x: selectedWord.x, y: selectedWord.y }}
          courseId={text.courseId}
          textId={text.id}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
