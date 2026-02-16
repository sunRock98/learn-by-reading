"use client";

import { useState, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  BarChart3,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  submitExerciseAnswer,
  generateExercisesForText,
} from "@/actions/exercises";
import { MultipleChoiceExercise } from "./multiple-choice-exercise";
import { FillBlankExercise } from "./fill-blank-exercise";
import { TrueFalseExercise } from "./true-false-exercise";
import { TranslationExercise } from "./translation-exercise";
import { SentenceOrderExercise } from "./sentence-order-exercise";
import type { ExerciseData } from "./types";

interface ExerciseSectionProps {
  textId: number;
  courseId: number;
  exercises: ExerciseData[];
}

interface ExerciseResult {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
}

const EXERCISE_TYPE_LABELS = {
  MULTIPLE_CHOICE: "multipleChoice",
  FILL_BLANK: "fillBlank",
  TRUE_FALSE: "trueFalse",
  TRANSLATION: "translation",
  SENTENCE_ORDER: "sentenceOrder",
} as const;

const EXERCISE_TYPE_ICONS = {
  MULTIPLE_CHOICE: "🔘",
  FILL_BLANK: "✏️",
  TRUE_FALSE: "✅",
  TRANSLATION: "🌐",
  SENTENCE_ORDER: "🔀",
} as const;

export function ExerciseSection({
  textId,
  courseId,
  exercises: initialExercises,
}: ExerciseSectionProps) {
  const [exercises] = useState<ExerciseData[]>(initialExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<number, ExerciseResult>>({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Exercises");

  const completedCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r) => r.correct).length;
  const totalCount = exercises.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const accuracy =
    completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;

  const currentExercise = exercises[currentIndex];

  const handleSubmitAnswer = useCallback(
    async (exerciseId: number, answer: string) => {
      const response = await submitExerciseAnswer({
        exerciseId,
        userAnswer: answer,
      });
      if (response.success && response.correct !== undefined) {
        setResults((prev) => ({
          ...prev,
          [exerciseId]: {
            correct: response.correct!,
            correctAnswer: response.correctAnswer || "",
            explanation: response.explanation,
          },
        }));
      }
    },
    []
  );

  const handleNext = useCallback(() => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  }, [currentIndex, exercises.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setResults({});
    setShowResults(false);
  }, []);

  const handleGenerateExercises = useCallback(() => {
    setIsGenerating(true);
    startTransition(async () => {
      try {
        const result = await generateExercisesForText({ textId, courseId });
        if (result.success) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to generate exercises:", error);
      } finally {
        setIsGenerating(false);
      }
    });
  }, [textId, courseId, startTransition]);

  if (exercises.length === 0) {
    return (
      <div className='border-border/50 bg-card overflow-hidden rounded-2xl border shadow-lg'>
        <div className='flex flex-col items-center gap-5 px-8 py-12 text-center'>
          <div className='gradient-bg animate-bounce-subtle flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg'>
            <Sparkles className='h-8 w-8 text-white' />
          </div>
          <h3 className='font-serif text-2xl font-bold'>
            {t("practiceExercises")}
          </h3>
          <p className='text-muted-foreground max-w-md font-serif'>
            {t("generateDescription")}
          </p>
          <Button
            onClick={handleGenerateExercises}
            disabled={isGenerating || isPending}
            size='lg'
            className='gradient-bg gap-2 border-0 text-white shadow-md hover:shadow-lg hover:brightness-110'
          >
            {isGenerating || isPending ? (
              <Loader2 className='h-5 w-5 animate-spin' />
            ) : (
              <Sparkles className='h-5 w-5' />
            )}
            {isGenerating || isPending
              ? t("generating")
              : t("generateExercises")}
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className='animate-scale-in border-border/50 bg-card overflow-hidden rounded-2xl border shadow-lg'>
        {/* Results Header */}
        <div className='flex flex-col items-center gap-4 px-8 pt-10 text-center'>
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl",
              accuracy >= 80
                ? "bg-[oklch(0.93_0.05_175)]"
                : accuracy >= 50
                  ? "bg-[oklch(0.93_0.06_75)]"
                  : "bg-[oklch(0.93_0.06_25)]"
            )}
          >
            <Trophy
              className={cn(
                "h-10 w-10",
                accuracy >= 80
                  ? "text-[oklch(0.48_0.14_175)]"
                  : accuracy >= 50
                    ? "text-[oklch(0.5_0.1_75)]"
                    : "text-[oklch(0.55_0.18_25)]"
              )}
            />
          </div>
          <h3 className='font-serif text-3xl font-bold'>
            {accuracy >= 80
              ? t("excellent")
              : accuracy >= 50
                ? t("goodJob")
                : t("keepPracticing")}
          </h3>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-3 gap-4 px-8 py-8'>
          <div className='border-border/50 bg-muted/30 flex flex-col items-center gap-1 rounded-xl border p-4'>
            <Target className='text-primary h-6 w-6' />
            <span className='font-serif text-2xl font-bold'>{accuracy}%</span>
            <span className='text-muted-foreground font-serif text-xs'>
              {t("accuracy")}
            </span>
          </div>
          <div className='border-border/50 bg-muted/30 flex flex-col items-center gap-1 rounded-xl border p-4'>
            <BarChart3 className='h-6 w-6 text-[oklch(0.55_0.14_175)]' />
            <span className='font-serif text-2xl font-bold'>
              {correctCount}/{totalCount}
            </span>
            <span className='text-muted-foreground font-serif text-xs'>
              {t("correctAnswers")}
            </span>
          </div>
          <div className='border-border/50 bg-muted/30 flex flex-col items-center gap-1 rounded-xl border p-4'>
            <BookOpen className='h-6 w-6 text-[oklch(0.52_0.13_220)]' />
            <span className='font-serif text-2xl font-bold'>{totalCount}</span>
            <span className='text-muted-foreground font-serif text-xs'>
              {t("totalExercises")}
            </span>
          </div>
        </div>

        {/* Exercise-by-exercise breakdown */}
        <div className='px-8 pb-4'>
          <div className='space-y-2'>
            {exercises.map((ex, index) => {
              const exResult = results[ex.id];
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setShowResults(false);
                    setCurrentIndex(index);
                  }}
                  className='border-border/50 hover:bg-muted/30 flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors'
                >
                  <span className='text-lg'>
                    {EXERCISE_TYPE_ICONS[ex.type]}
                  </span>
                  <span className='flex-1 truncate font-serif text-sm'>
                    {ex.question}
                  </span>
                  {exResult ? (
                    exResult.correct ? (
                      <Badge className='rounded-full bg-[oklch(0.93_0.05_175)] text-[oklch(0.35_0.1_175)]'>
                        {t("correctBadge")}
                      </Badge>
                    ) : (
                      <Badge className='rounded-full bg-[oklch(0.93_0.06_25)] text-[oklch(0.42_0.12_25)]'>
                        {t("incorrectBadge")}
                      </Badge>
                    )
                  ) : (
                    <Badge variant='outline' className='rounded-full'>
                      {t("skipped")}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className='border-border/50 border-t px-8 py-4'>
          <div className='flex justify-center gap-3'>
            <Button
              variant='outline'
              onClick={handleRestart}
              className='group gap-2'
            >
              <RefreshCw className='h-4 w-4 transition-transform group-hover:rotate-180' />
              {t("tryAgain")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='animate-fade-in border-border/50 bg-card overflow-hidden rounded-2xl border shadow-lg'>
      {/* Exercise Header */}
      <div className='px-8 pt-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='gradient-bg flex h-10 w-10 items-center justify-center rounded-xl shadow-md'>
              <BookOpen className='h-5 w-5 text-white' />
            </div>
            <div>
              <h3 className='font-serif text-lg font-bold'>
                {t("practiceExercises")}
              </h3>
              <p className='text-muted-foreground font-serif text-sm'>
                {t("exerciseOf", {
                  current: currentIndex + 1,
                  total: totalCount,
                })}
              </p>
            </div>
          </div>
          <Badge variant='outline' className='rounded-full font-serif'>
            {t(EXERCISE_TYPE_LABELS[currentExercise.type])}
          </Badge>
        </div>

        {/* Progress */}
        <div className='mb-2 flex items-center gap-3'>
          <Progress value={progressPercentage} className='flex-1' />
          <span className='text-muted-foreground font-serif text-sm'>
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Exercise dots */}
        <div className='mb-6 flex gap-1.5'>
          {exercises.map((ex, index) => {
            const exResult = results[ex.id];
            return (
              <button
                key={ex.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all",
                  index === currentIndex
                    ? "gradient-bg"
                    : exResult
                      ? exResult.correct
                        ? "bg-[oklch(0.58_0.14_175)]"
                        : "bg-[oklch(0.62_0.14_25)]"
                      : "bg-secondary"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className='flex items-center justify-center gap-4 px-8 pb-2'>
        <div className='bg-linear-to-r via-border h-px flex-1 from-transparent to-transparent' />
        <span className='text-lg'>
          {EXERCISE_TYPE_ICONS[currentExercise.type]}
        </span>
        <div className='bg-linear-to-r via-border h-px flex-1 from-transparent to-transparent' />
      </div>

      {/* Exercise Content */}
      <div className='px-8 py-6'>
        {currentExercise.type === "MULTIPLE_CHOICE" && (
          <MultipleChoiceExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onSubmit={handleSubmitAnswer}
            result={results[currentExercise.id] || null}
          />
        )}
        {currentExercise.type === "FILL_BLANK" && (
          <FillBlankExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onSubmit={handleSubmitAnswer}
            result={results[currentExercise.id] || null}
          />
        )}
        {currentExercise.type === "TRUE_FALSE" && (
          <TrueFalseExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onSubmit={handleSubmitAnswer}
            result={results[currentExercise.id] || null}
          />
        )}
        {currentExercise.type === "TRANSLATION" && (
          <TranslationExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onSubmit={handleSubmitAnswer}
            result={results[currentExercise.id] || null}
          />
        )}
        {currentExercise.type === "SENTENCE_ORDER" && (
          <SentenceOrderExercise
            key={currentExercise.id}
            exercise={currentExercise}
            onSubmit={handleSubmitAnswer}
            result={results[currentExercise.id] || null}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className='border-border/50 border-t px-8 py-4'>
        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className='group gap-2 font-serif'
          >
            <ChevronLeft className='h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
            {t("previous")}
          </Button>

          {completedCount === totalCount && (
            <Button
              onClick={() => setShowResults(true)}
              variant='outline'
              className='gap-2 font-serif'
            >
              <BarChart3 className='h-4 w-4' />
              {t("viewResults")}
            </Button>
          )}

          <Button
            variant={results[currentExercise.id] ? "default" : "ghost"}
            onClick={handleNext}
            className={cn(
              "group gap-2 font-serif",
              results[currentExercise.id] && "gradient-bg border-0 text-white"
            )}
          >
            {currentIndex === exercises.length - 1 ? t("finish") : t("next")}
            <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
