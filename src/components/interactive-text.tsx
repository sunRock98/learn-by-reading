"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TranslationPopup } from "@/components/translation-popup";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";
import { AudioReader } from "@/components/audio-reader";

interface Text {
  id: number;
  title: string;
  content: string;
  courseId: number;
}

interface Course {
  language: {
    name: string;
  };
  level: {
    name: string;
  };
}

interface InteractiveTextProps {
  text: Text;
  course: Course;
  userNativeLanguage: string;
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
}: InteractiveTextProps) {
  const [selectedWord, setSelectedWord] = useState<WordPosition | null>(null);
  const [completedReading, setCompletedReading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("read");
  const router = useRouter();

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

  const handleCompleteReading = useCallback(() => {
    setCompletedReading(true);
    setTimeout(() => {
      router.push(`/course/${text.courseId}`);
    }, 2000);
  }, [router, text.courseId]);

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

        return (
          <span
            key={index}
            onClick={handleWordClick}
            className='hover:bg-accent/30 hover:text-accent-foreground cursor-pointer rounded px-0.5 transition-colors'
            role='button'
            tabIndex={0}
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
    [handleWordClick]
  );

  return (
    <div>
      {/* Header with Title and Mode Toggle */}
      <Card className='mb-6 p-8'>
        <div className='mb-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h1 className='text-balance text-3xl font-bold'>{text.title}</h1>
            <Badge variant='secondary'>{course.level.name}</Badge>
          </div>

          {/* Mode Toggle */}
          <div className='flex gap-2'>
            <Button
              variant={viewMode === "read" ? "default" : "outline"}
              size='sm'
              onClick={() => setViewMode("read")}
              className='gap-2'
            >
              <BookOpen className='h-4 w-4' />
              Read
            </Button>
            <Button
              variant={viewMode === "listen" ? "default" : "outline"}
              size='sm'
              onClick={() => setViewMode("listen")}
              className='gap-2'
            >
              <Headphones className='h-4 w-4' />
              Listen
            </Button>
          </div>
        </div>

        {/* Read Mode */}
        {viewMode === "read" && (
          <>
            <p className='text-muted-foreground mb-4 text-sm'>
              Click on any word to see its translation and add it to your
              dictionary
            </p>
            <div className='prose prose-lg max-w-none'>
              <div className='whitespace-pre-line text-lg leading-relaxed'>
                {renderInteractiveText(text.content)}
              </div>
            </div>
          </>
        )}

        {/* Listen Mode */}
        {viewMode === "listen" && (
          <div className='mt-4'>
            <AudioReader text={text.content} language={course.language.name} />
          </div>
        )}
      </Card>

      {!completedReading ? (
        <div className='flex justify-center'>
          <Button onClick={handleCompleteReading} size='lg' className='gap-2'>
            <CheckCircle2 className='h-5 w-5' />
            Mark as Complete
          </Button>
        </div>
      ) : (
        <Card className='border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950'>
          <div className='flex items-center gap-3 text-green-800 dark:text-green-200'>
            <CheckCircle2 className='h-6 w-6' />
            <div>
              <p className='font-semibold'>Great job!</p>
              <p className='text-sm'>Returning to course...</p>
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
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
