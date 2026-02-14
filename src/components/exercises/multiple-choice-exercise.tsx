"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, CircleDot } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ExerciseComponentProps } from "./types";

export function MultipleChoiceExercise({
  exercise,
  onSubmit,
  result,
  disabled,
}: ExerciseComponentProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Exercises");

  const options: string[] = exercise.options
    ? JSON.parse(exercise.options)
    : [];

  const handleSubmit = async () => {
    if (!selectedOption || disabled) return;
    setIsSubmitting(true);
    try {
      await onSubmit(exercise.id, selectedOption);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!result) {
      return selectedOption === option
        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
        : "border-border hover:border-primary/50 hover:bg-accent/30";
    }

    if (option === result.correctAnswer) {
      return "border-green-500 bg-green-50 dark:bg-green-950/30";
    }

    if (selectedOption === option && !result.correct) {
      return "border-red-500 bg-red-50 dark:bg-red-950/30";
    }

    return "border-border opacity-50";
  };

  return (
    <div className='space-y-4'>
      <p className='font-serif text-lg text-[#1a1a18] dark:text-[#e8e6dc]'>
        {exercise.question}
      </p>

      <div className='space-y-3'>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !result && !disabled && setSelectedOption(option)}
            disabled={!!result || disabled}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
              getOptionStyle(option),
              !result && !disabled && "cursor-pointer"
            )}
          >
            <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium'>
              {String.fromCharCode(65 + index)}
            </span>
            <span className='flex-1 font-serif text-base'>{option}</span>
            {result && option === result.correctAnswer && (
              <CheckCircle2 className='h-5 w-5 shrink-0 text-green-500' />
            )}
            {result &&
              selectedOption === option &&
              !result.correct &&
              option !== result.correctAnswer && (
                <XCircle className='h-5 w-5 shrink-0 text-red-500' />
              )}
          </button>
        ))}
      </div>

      {!result && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting || disabled}
          className='gap-2'
        >
          <CircleDot className='h-4 w-4' />
          {isSubmitting ? t("checking") : t("checkAnswer")}
        </Button>
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
