"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Languages, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ExerciseComponentProps } from "./types";

export function TranslationExercise({
  exercise,
  onSubmit,
  result,
  disabled,
}: ExerciseComponentProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Exercises");

  const handleSubmit = async () => {
    if (!answer.trim() || disabled) return;
    setIsSubmitting(true);
    try {
      await onSubmit(exercise.id, answer.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <Languages className='h-5 w-5 text-[#c41e3a]' />
        <p className='font-serif text-sm uppercase tracking-widest text-[#8a8677] dark:text-[#6a6a5f]'>
          {t("translateThis")}
        </p>
      </div>

      <div className='rounded-lg border-2 border-dashed border-[#d4d0c4] bg-[#f5f3e8]/50 px-6 py-4 dark:border-[#3a3a38] dark:bg-[#151513]/50'>
        <p className='font-serif text-2xl font-medium text-[#1a1a18] dark:text-[#e8e6dc]'>
          {exercise.question}
        </p>
      </div>

      <div className='space-y-2'>
        {result ? (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-3 font-serif text-lg",
              result.correct
                ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                : "border-red-500 bg-red-50 dark:bg-red-950/30"
            )}
          >
            {result.correct ? (
              <CheckCircle2 className='h-5 w-5 shrink-0 text-green-500' />
            ) : (
              <XCircle className='h-5 w-5 shrink-0 text-red-500' />
            )}
            <span>{answer}</span>
          </div>
        ) : (
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t("typeTranslation")}
            disabled={disabled}
            className='font-serif text-lg'
          />
        )}
      </div>

      {!result && (
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting || disabled}
          className='gap-2'
        >
          <Languages className='h-4 w-4' />
          {isSubmitting ? t("checking") : t("checkAnswer")}
        </Button>
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
