"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PenLine, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ExerciseComponentProps } from "./types";

export function FillBlankExercise({
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

  // Split question at ___ to render the blank inline
  const parts = exercise.question.split("___");
  const hasBlank = parts.length > 1;

  return (
    <div className='space-y-4'>
      {hasBlank ? (
        <div className='font-serif text-lg leading-relaxed text-[#1a1a18] dark:text-[#e8e6dc]'>
          {parts[0]}
          {result ? (
            <span
              className={cn(
                "mx-1 inline-block rounded border-b-2 px-2 py-0.5 font-semibold",
                result.correct
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
              )}
            >
              {answer || result.correctAnswer}
              {result.correct ? (
                <CheckCircle2 className='ml-1 inline h-4 w-4' />
              ) : (
                <XCircle className='ml-1 inline h-4 w-4' />
              )}
            </span>
          ) : (
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={t("typeAnswer")}
              disabled={disabled}
              className='mx-1 inline-block w-40 rounded-none border-b-2 border-l-0 border-r-0 border-t-0 bg-transparent px-2 font-serif text-lg focus-visible:ring-0'
            />
          )}
          {parts[1]}
        </div>
      ) : (
        <div>
          <p className='font-serif text-lg text-[#1a1a18] dark:text-[#e8e6dc]'>
            {exercise.question}
          </p>
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t("typeAnswer")}
            disabled={!!result || disabled}
            className='mt-3 font-serif'
          />
        </div>
      )}

      {!result && (
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting || disabled}
          className='gap-2'
        >
          <PenLine className='h-4 w-4' />
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
