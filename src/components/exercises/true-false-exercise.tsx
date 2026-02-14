"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X, CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ExerciseComponentProps } from "./types";

export function TrueFalseExercise({
  exercise,
  onSubmit,
  result,
  disabled,
}: ExerciseComponentProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Exercises");

  const handleSubmit = async (answer: string) => {
    if (disabled || result) return;
    setSelectedAnswer(answer);
    setIsSubmitting(true);
    try {
      await onSubmit(exercise.id, answer);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonStyle = (value: string) => {
    if (!result) {
      return selectedAnswer === value
        ? "ring-2 ring-primary/30 border-primary"
        : "";
    }

    const isCorrectAnswer = result.correctAnswer === value;
    const isSelected = selectedAnswer === value;

    if (isCorrectAnswer) {
      return "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300";
    }

    if (isSelected && !result.correct) {
      return "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300";
    }

    return "opacity-50";
  };

  return (
    <div className='space-y-4'>
      <p className='font-serif text-lg text-[#1a1a18] dark:text-[#e8e6dc]'>
        {exercise.question}
      </p>

      <div className='flex gap-4'>
        <button
          onClick={() => handleSubmit("true")}
          disabled={!!result || disabled || isSubmitting}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-6 py-4 font-serif text-lg font-medium transition-all",
            !result && !disabled && "hover:bg-accent/30 cursor-pointer",
            getButtonStyle("true")
          )}
        >
          <Check className='h-5 w-5' />
          {t("true")}
          {result && result.correctAnswer === "true" && (
            <CheckCircle2 className='ml-1 h-5 w-5 text-green-500' />
          )}
          {result &&
            selectedAnswer === "true" &&
            result.correctAnswer !== "true" && (
              <XCircle className='ml-1 h-5 w-5 text-red-500' />
            )}
        </button>

        <button
          onClick={() => handleSubmit("false")}
          disabled={!!result || disabled || isSubmitting}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-6 py-4 font-serif text-lg font-medium transition-all",
            !result && !disabled && "hover:bg-accent/30 cursor-pointer",
            getButtonStyle("false")
          )}
        >
          <X className='h-5 w-5' />
          {t("false")}
          {result && result.correctAnswer === "false" && (
            <CheckCircle2 className='ml-1 h-5 w-5 text-green-500' />
          )}
          {result &&
            selectedAnswer === "false" &&
            result.correctAnswer !== "false" && (
              <XCircle className='ml-1 h-5 w-5 text-red-500' />
            )}
        </button>
      </div>

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
