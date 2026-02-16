"use client";

import { useState, useCallback, useTransition } from "react";
import { Card } from "@/components/ui/card";
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
          // Reload the page to get fresh exercises
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to generate exercises:", error);
      } finally {
        setIsGenerating(false);
      }
    });
  }, [textId, courseId, startTransition]);

  // No exercises yet — show generate button
  if (exercises.length === 0) {
    return (
      <Card className='border-0 bg-[#fffef8] shadow-lg dark:bg-[#1a1a18]'>
        <div className='flex flex-col items-center gap-4 px-8 py-12 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-[#c41e3a]/10'>
            <Sparkles className='h-8 w-8 text-[#c41e3a]' />
          </div>
          <h3 className='font-serif text-2xl font-medium text-[#1a1a18] dark:text-[#e8e6dc]'>
            {t("practiceExercises")}
          </h3>
          <p className='max-w-md font-serif text-[#5a5a52] dark:text-[#9a9a8f]'>
            {t("generateDescription")}
          </p>
          <Button
            onClick={handleGenerateExercises}
            disabled={isGenerating || isPending}
            size='lg'
            className='gap-2'
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
      </Card>
    );
  }

  // Show results summary
  if (showResults) {
    return (
      <Card className='border-0 bg-[#fffef8] shadow-lg dark:bg-[#1a1a18]'>
        {/* Results Header */}
        <div className='flex flex-col items-center gap-4 px-8 pt-10 text-center'>
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full",
              accuracy >= 80
                ? "bg-green-100 dark:bg-green-950/30"
                : accuracy >= 50
                  ? "bg-amber-100 dark:bg-amber-950/30"
                  : "bg-red-100 dark:bg-red-950/30"
            )}
          >
            <Trophy
              className={cn(
                "h-10 w-10",
                accuracy >= 80
                  ? "text-green-600"
                  : accuracy >= 50
                    ? "text-amber-600"
                    : "text-red-600"
              )}
            />
          </div>
          <h3 className='font-serif text-3xl font-medium text-[#1a1a18] dark:text-[#e8e6dc]'>
            {accuracy >= 80
              ? t("excellent")
              : accuracy >= 50
                ? t("goodJob")
                : t("keepPracticing")}
          </h3>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-3 gap-4 px-8 py-8'>
          <div className='flex flex-col items-center gap-1 rounded-lg border border-[#d4d0c4] bg-[#f5f3e8]/50 p-4 dark:border-[#3a3a38] dark:bg-[#151513]/50'>
            <Target className='h-6 w-6 text-[#c41e3a]' />
            <span className='font-serif text-2xl font-bold text-[#1a1a18] dark:text-[#e8e6dc]'>
              {accuracy}%
            </span>
            <span className='font-serif text-xs text-[#8a8677] dark:text-[#6a6a5f]'>
              {t("accuracy")}
            </span>
          </div>
          <div className='flex flex-col items-center gap-1 rounded-lg border border-[#d4d0c4] bg-[#f5f3e8]/50 p-4 dark:border-[#3a3a38] dark:bg-[#151513]/50'>
            <BarChart3 className='h-6 w-6 text-green-600' />
            <span className='font-serif text-2xl font-bold text-[#1a1a18] dark:text-[#e8e6dc]'>
              {correctCount}/{totalCount}
            </span>
            <span className='font-serif text-xs text-[#8a8677] dark:text-[#6a6a5f]'>
              {t("correctAnswers")}
            </span>
          </div>
          <div className='flex flex-col items-center gap-1 rounded-lg border border-[#d4d0c4] bg-[#f5f3e8]/50 p-4 dark:border-[#3a3a38] dark:bg-[#151513]/50'>
            <BookOpen className='h-6 w-6 text-blue-600' />
            <span className='font-serif text-2xl font-bold text-[#1a1a18] dark:text-[#e8e6dc]'>
              {totalCount}
            </span>
            <span className='font-serif text-xs text-[#8a8677] dark:text-[#6a6a5f]'>
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
                  className='border-border hover:bg-accent/30 flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors'
                >
                  <span className='text-lg'>
                    {EXERCISE_TYPE_ICONS[ex.type]}
                  </span>
                  <span className='flex-1 truncate font-serif text-sm'>
                    {ex.question}
                  </span>
                  {exResult ? (
                    exResult.correct ? (
                      <Badge className='bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                        {t("correctBadge")}
                      </Badge>
                    ) : (
                      <Badge className='bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                        {t("incorrectBadge")}
                      </Badge>
                    )
                  ) : (
                    <Badge variant='outline'>{t("skipped")}</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className='border-t border-[#d4d0c4] px-8 py-4 dark:border-[#3a3a38]'>
          <div className='flex justify-center gap-3'>
            <Button variant='outline' onClick={handleRestart} className='gap-2'>
              <RefreshCw className='h-4 w-4' />
              {t("tryAgain")}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Render individual exercise
  return (
    <Card className='border-0 bg-[#fffef8] shadow-lg dark:bg-[#1a1a18]'>
      {/* Exercise Header */}
      <div className='px-8 pt-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#c41e3a]/10'>
              <BookOpen className='h-5 w-5 text-[#c41e3a]' />
            </div>
            <div>
              <h3 className='font-serif text-lg font-medium text-[#1a1a18] dark:text-[#e8e6dc]'>
                {t("practiceExercises")}
              </h3>
              <p className='font-serif text-sm text-[#8a8677] dark:text-[#6a6a5f]'>
                {t("exerciseOf", {
                  current: currentIndex + 1,
                  total: totalCount,
                })}
              </p>
            </div>
          </div>
          <Badge variant='outline' className='font-serif'>
            {t(EXERCISE_TYPE_LABELS[currentExercise.type])}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className='mb-2 flex items-center gap-3'>
          <Progress value={progressPercentage} className='flex-1' />
          <span className='font-serif text-sm text-[#8a8677] dark:text-[#6a6a5f]'>
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
                    ? "bg-[#c41e3a]"
                    : exResult
                      ? exResult.correct
                        ? "bg-green-500"
                        : "bg-red-400"
                      : "bg-[#d4d0c4] dark:bg-[#3a3a38]"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className='flex items-center justify-center gap-4 px-8 pb-2'>
        <div className='h-px flex-1 bg-[#d4d0c4] dark:bg-[#3a3a38]' />
        <span className='text-lg'>
          {EXERCISE_TYPE_ICONS[currentExercise.type]}
        </span>
        <div className='h-px flex-1 bg-[#d4d0c4] dark:bg-[#3a3a38]' />
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
      <div className='border-t border-[#d4d0c4] px-8 py-4 dark:border-[#3a3a38]'>
        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className='gap-2 font-serif'
          >
            <ChevronLeft className='h-4 w-4' />
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
            className='gap-2 font-serif'
          >
            {currentIndex === exercises.length - 1 ? t("finish") : t("next")}
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </Card>
  );
}
