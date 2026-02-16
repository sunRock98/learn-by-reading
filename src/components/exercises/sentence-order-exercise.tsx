"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpDown, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ExerciseComponentProps } from "./types";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SentenceOrderExercise({
  exercise,
  onSubmit,
  result,
  disabled,
}: ExerciseComponentProps) {
  const shuffledWords = useMemo<string[]>(() => {
    const raw: string[] = exercise.options ? JSON.parse(exercise.options) : [];

    // If options contain multi-word strings (bad AI output), derive
    // individual words from correctAnswer and shuffle them instead
    const hasMultiWordOptions = raw.some((opt) => opt.trim().includes(" "));
    if (hasMultiWordOptions && exercise.correctAnswer) {
      const words = exercise.correctAnswer.split(/\s+/).filter(Boolean);
      return shuffleArray(words);
    }

    return raw;
  }, [exercise.options, exercise.correctAnswer]);

  const [availableWords, setAvailableWords] = useState<string[]>(shuffledWords);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Exercises");

  const handleSelectWord = useCallback(
    (word: string, index: number) => {
      if (result || disabled) return;
      setAvailableWords((prev) => prev.filter((_, i) => i !== index));
      setSelectedWords((prev) => [...prev, word]);
    },
    [result, disabled]
  );

  const handleRemoveWord = useCallback(
    (word: string, index: number) => {
      if (result || disabled) return;
      setSelectedWords((prev) => prev.filter((_, i) => i !== index));
      setAvailableWords((prev) => [...prev, word]);
    },
    [result, disabled]
  );

  const handleReset = useCallback(() => {
    if (result || disabled) return;
    setAvailableWords(shuffledWords);
    setSelectedWords([]);
  }, [result, disabled, shuffledWords]);

  const handleSubmit = async () => {
    if (selectedWords.length === 0 || disabled) return;
    setIsSubmitting(true);
    try {
      await onSubmit(exercise.id, selectedWords.join(" "));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <ArrowUpDown className='h-5 w-5 text-[#c41e3a]' />
        <p className='font-serif text-lg text-[#1a1a18] dark:text-[#e8e6dc]'>
          {exercise.question}
        </p>
      </div>

      {/* Selected words area (answer being built) */}
      <div
        className={cn(
          "min-h-[60px] rounded-lg border-2 border-dashed p-3",
          result
            ? result.correct
              ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
              : "border-red-500 bg-red-50/50 dark:bg-red-950/20"
            : "border-[#d4d0c4] bg-[#f5f3e8]/30 dark:border-[#3a3a38] dark:bg-[#151513]/30"
        )}
      >
        {selectedWords.length === 0 ? (
          <p className='text-muted-foreground py-2 text-center font-serif text-sm'>
            {t("clickWordsToOrder")}
          </p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {selectedWords.map((word, index) => (
              <button
                key={`selected-${index}`}
                onClick={() => handleRemoveWord(word, index)}
                disabled={!!result || disabled}
                className={cn(
                  "rounded-md border px-3 py-1.5 font-serif text-base transition-all",
                  result
                    ? result.correct
                      ? "border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200"
                      : "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
                    : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                )}
              >
                {word}
              </button>
            ))}
            {result && (
              <span className='flex items-center'>
                {result.correct ? (
                  <CheckCircle2 className='h-5 w-5 text-green-500' />
                ) : (
                  <XCircle className='h-5 w-5 text-red-500' />
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Available words to pick from */}
      {!result && availableWords.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {availableWords.map((word, index) => (
            <button
              key={`available-${index}`}
              onClick={() => handleSelectWord(word, index)}
              disabled={disabled}
              className='border-border bg-background hover:border-primary/50 hover:bg-accent/30 cursor-pointer rounded-md border px-3 py-1.5 font-serif text-base transition-all'
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {!result && (
        <div className='flex gap-2'>
          <Button
            onClick={handleSubmit}
            disabled={
              selectedWords.length === 0 ||
              availableWords.length > 0 ||
              isSubmitting ||
              disabled
            }
            className='gap-2'
          >
            <ArrowUpDown className='h-4 w-4' />
            {isSubmitting ? t("checking") : t("checkAnswer")}
          </Button>
          {selectedWords.length > 0 && (
            <Button variant='outline' onClick={handleReset} className='gap-2'>
              <RotateCcw className='h-4 w-4' />
              {t("reset")}
            </Button>
          )}
        </div>
      )}

      {result && !result.correct && (
        <p className='text-muted-foreground font-serif text-sm'>
          {t("correctAnswerWas")}{" "}
          <span className='font-semibold text-green-600 dark:text-green-400'>
            {result.correctAnswer}
          </span>
        </p>
      )}

      {result && result.explanation && (
        <div
          className={cn(
            "rounded-lg p-4 font-serif text-sm",
            result.correct
              ? "border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
              : "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
          )}
        >
          <p className='font-semibold'>
            {result.correct ? t("correct") : t("incorrect")}
          </p>
          <p className='mt-1'>{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
