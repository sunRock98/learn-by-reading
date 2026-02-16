"use client";

import type React from "react";
import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { TranslationPopup } from "@/components/translation-popup";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Headphones } from "lucide-react";
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

  // Create a map for quick lookup of dictionary words
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

      // Clean the word (remove punctuation)
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
    // Update word mastery based on which words were clicked/not clicked
    await updateWordMasteryOnTextComplete(text.id);

    // Mark the text as completed in user progress
    await markTextAsComplete(text.id, text.courseId);

    setCompletedReading(true);
    setJustCompleted(true);
    setTimeout(() => {
      router.push(`/course/${text.courseId}`);
    }, 2000);
  }, [router, text.courseId, text.id]);

  const renderInteractiveText = useCallback(
    (content: string) => {
      // Split by whitespace but keep the separators
      const words = content.split(/(\s+)/);

      return words.map((word, index) => {
        if (word.trim() === "") {
          return <span key={index}>{word}</span>;
        }

        // Check if it's a clickable word (contains letters)
        const hasLetters = /[a-zA-ZÀ-ÿ]/.test(word);

        if (!hasLetters) {
          return <span key={index}>{word}</span>;
        }

        // Check if word is in dictionary and get its mastery level
        const cleanedWord = word
          .toLowerCase()
          .replace(/[.,!?;:'"()«»—–]/g, "")
          .trim();
        const masteryLevel = dictionaryMap.get(cleanedWord);

        // Determine styling based on mastery level
        const highlightClass = masteryLevel
          ? cn(
              "underline decoration-2 underline-offset-2",
              masteryLevel === MasteryLevel.LEARNING &&
                "decoration-yellow-500 dark:decoration-yellow-400",
              masteryLevel === MasteryLevel.REVIEWING &&
                "decoration-blue-500 dark:decoration-blue-400",
              masteryLevel === MasteryLevel.MASTERED &&
                "decoration-green-500 dark:decoration-green-400"
            )
          : "";

        return (
          <span
            key={index}
            onClick={handleWordClick}
            className={cn(
              "hover:bg-accent/30 hover:text-accent-foreground cursor-pointer rounded px-0.5 transition-colors",
              highlightClass
            )}
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
    <div>
      {/* New Yorker Magazine Style Layout - Split Header */}
      <Card className='mb-6 overflow-hidden border-0 bg-[#fffef8] shadow-lg dark:bg-[#1a1a18]'>
        {/* Hero Section - Split Grid Layout */}
        <div
          className={`grid min-h-[400px] ${text.pictureUrl ? "md:grid-cols-2" : "grid-cols-1"}`}
        >
          {/* Left Side - Title & Info */}
          <div className='flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16'>
            {/* Category Tag */}
            <span className='mb-6 font-serif text-sm font-medium uppercase tracking-[0.25em] text-[#c41e3a]'>
              {course.language.name} · {course.level.name}
            </span>

            {/* Title - New Yorker Style */}
            <h1 className='mb-6 font-serif text-3xl font-normal uppercase leading-[1.1] tracking-[-0.02em] text-[#1a1a18] md:text-4xl lg:text-5xl dark:text-[#e8e6dc]'>
              {text.title}
            </h1>

            {/* Subtitle / Description */}
            <p className='mb-8 font-serif text-lg italic text-[#5a5a52] dark:text-[#9a9a8f]'>
              {t("clickToTranslate")}
            </p>

            {/* Mode Toggle */}
            <div className='flex gap-3'>
              <Button
                variant={viewMode === "read" ? "default" : "outline"}
                size='sm'
                onClick={() => setViewMode("read")}
                className='gap-2 font-serif'
              >
                <BookOpen className='h-4 w-4' />
                {t("read")}
              </Button>
              <Button
                variant={viewMode === "listen" ? "default" : "outline"}
                size='sm'
                onClick={() => setViewMode("listen")}
                className='gap-2 font-serif'
              >
                <Headphones className='h-4 w-4' />
                {t("listen")}
              </Button>
            </div>
          </div>

          {/* Right Side - Large Image */}
          {text.pictureUrl && (
            <div className='relative min-h-[300px] md:min-h-full'>
              <Image
                src={text.pictureUrl}
                alt={`Illustration for ${text.title}`}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, 50vw'
                priority
              />
              {/* Gradient overlay for better text contrast on mobile */}
              <div className='absolute inset-0 bg-gradient-to-t from-[#1a1a18]/20 to-transparent md:hidden' />
            </div>
          )}
        </div>

        {/* Divider Line */}
        <div className='flex items-center justify-center gap-4 px-8 py-6'>
          <div className='h-px flex-1 bg-[#d4d0c4] dark:bg-[#3a3a38]' />
          <div className='h-2 w-2 rotate-45 bg-[#c41e3a]' />
          <div className='h-px flex-1 bg-[#d4d0c4] dark:bg-[#3a3a38]' />
        </div>

        {/* Content Section */}
        <div className='px-8 pb-8 md:px-12 lg:px-16'>
          {/* Read Mode */}
          {viewMode === "read" && (
            <div className='mx-auto max-w-2xl'>
              <div className='font-serif text-lg leading-[1.9] text-[#1a1a18] dark:text-[#e8e6dc]'>
                <div className='whitespace-pre-line'>
                  {renderInteractiveText(text.content)}
                </div>
              </div>
            </div>
          )}

          {/* Listen Mode */}
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
        <div className='border-t border-[#d4d0c4] bg-[#f5f3e8] px-8 py-4 dark:border-[#3a3a38] dark:bg-[#151513]'>
          <div className='flex items-center justify-center gap-2 font-serif text-xs uppercase tracking-widest text-[#8a8677] dark:text-[#6a6a5f]'>
            <span>◆</span>
            <span>Learn by Reading</span>
            <span>◆</span>
          </div>
        </div>
      </Card>

      {!completedReading ? (
        <div className='flex justify-center'>
          <Button onClick={handleCompleteReading} size='lg' className='gap-2'>
            <CheckCircle2 className='h-5 w-5' />
            {t("markComplete")}
          </Button>
        </div>
      ) : isCompleted && !justCompleted ? (
        <Card className='border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950'>
          <div className='flex items-center gap-3 text-green-800 dark:text-green-200'>
            <CheckCircle2 className='h-6 w-6' />
            <p className='font-semibold'>{t("alreadyCompleted")}</p>
          </div>
        </Card>
      ) : (
        <Card className='border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950'>
          <div className='flex items-center gap-3 text-green-800 dark:text-green-200'>
            <CheckCircle2 className='h-6 w-6' />
            <div>
              <p className='font-semibold'>{t("greatJob")}</p>
              <p className='text-sm'>{t("returningToCourse")}</p>
            </div>
          </div>
        </Card>
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
