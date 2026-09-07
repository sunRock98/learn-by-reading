"use server";

import {
  generateExercises,
  type GeneratedExercise,
} from "@/api/openai/generateExercises";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ExerciseType } from "@prisma/client";
import { checkExerciseAnswer } from "@/lib/exercise-answer";

// ─── Generate Exercises for a Text ─────────────────────────────────────────

interface GenerateExercisesForTextParams {
  textId: number;
  courseId: number;
}

interface GenerateExercisesResult {
  success: boolean;
  count?: number;
  error?: string;
}

export const generateExercisesForText = async ({
  textId,
  courseId,
}: GenerateExercisesForTextParams): Promise<GenerateExercisesResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch the text with course info
    const text = await db.text.findUnique({
      where: { id: textId, courseId },
      include: {
        course: {
          include: {
            language: true,
            level: true,
          },
        },
        exercises: { select: { id: true } },
      },
    });

    if (!text) {
      return { success: false, error: "Text not found" };
    }

    // Don't regenerate if exercises already exist
    if (text.exercises.length > 0) {
      return { success: true, count: text.exercises.length };
    }

    // Get user's native language
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { nativeLanguage: true },
    });

    const motherLanguage = userData?.nativeLanguage || "English";

    // Generate exercises via OpenAI
    const exercises = await generateExercises({
      textContent: text.content,
      textTitle: text.title,
      language: text.course.language.name,
      level: text.course.level.name,
      motherLanguage,
    });

    // Save exercises to database
    const exerciseData = exercises.map(
      (exercise: GeneratedExercise, index: number) => ({
        type: exercise.type as ExerciseType,
        question: exercise.question,
        options: exercise.options ? JSON.stringify(exercise.options) : null,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation || "",
        content: exercise.question, // Legacy field
        textId,
        orderIndex: index,
      })
    );

    await db.exercise.createMany({
      data: exerciseData,
    });

    return { success: true, count: exercises.length };
  } catch (error) {
    console.error("Error generating exercises:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate exercises",
    };
  }
};

// ─── Submit Exercise Answer ─────────────────────────────────────────────────

interface SubmitAnswerParams {
  exerciseId: number;
  userAnswer: string;
}

interface SubmitAnswerResult {
  success: boolean;
  correct?: boolean;
  correctAnswer?: string;
  explanation?: string;
  error?: string;
}

export const submitExerciseAnswer = async ({
  exerciseId,
  userAnswer,
}: SubmitAnswerParams): Promise<SubmitAnswerResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return { success: false, error: "Exercise not found" };
    }

    // Check correctness based on exercise type
    const isCorrect = checkExerciseAnswer(
      exercise.type,
      userAnswer,
      exercise.correctAnswer
    );

    // Upsert progress record
    await db.userExerciseProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: user.id,
          exerciseId,
        },
      },
      create: {
        userId: user.id,
        exerciseId,
        completed: true,
        correct: isCorrect,
        userAnswer,
        attempts: 1,
        answeredAt: new Date(),
      },
      update: {
        completed: true,
        correct: isCorrect,
        userAnswer,
        attempts: { increment: 1 },
        answeredAt: new Date(),
      },
    });

    return {
      success: true,
      correct: isCorrect,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation || undefined,
    };
  } catch (error) {
    console.error("Error submitting exercise answer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit answer",
    };
  }
};

// ─── Get Exercise Progress for a Text ───────────────────────────────────────

interface ExerciseWithProgress {
  id: number;
  type: ExerciseType;
  question: string;
  options: string | null;
  correctAnswer: string;
  explanation: string | null;
  orderIndex: number;
  userProgress?: {
    completed: boolean;
    correct: boolean | null;
    userAnswer: string | null;
    attempts: number;
  } | null;
}

interface GetExercisesResult {
  success: boolean;
  exercises?: ExerciseWithProgress[];
  stats?: {
    total: number;
    completed: number;
    correct: number;
    accuracy: number;
  };
  error?: string;
}

export const getExercisesForText = async (
  textId: number
): Promise<GetExercisesResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const exercises = await db.exercise.findMany({
      where: { textId },
      orderBy: { orderIndex: "asc" },
      include: {
        progress: {
          where: { userId: user.id },
          select: {
            completed: true,
            correct: true,
            userAnswer: true,
            attempts: true,
          },
        },
      },
    });

    const exercisesWithProgress: ExerciseWithProgress[] = exercises.map(
      (ex) => ({
        id: ex.id,
        type: ex.type,
        question: ex.question,
        options: ex.options,
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        orderIndex: ex.orderIndex,
        userProgress: ex.progress[0] || null,
      })
    );

    const completed = exercisesWithProgress.filter(
      (e) => e.userProgress?.completed
    ).length;
    const correct = exercisesWithProgress.filter(
      (e) => e.userProgress?.correct
    ).length;

    return {
      success: true,
      exercises: exercisesWithProgress,
      stats: {
        total: exercises.length,
        completed,
        correct,
        accuracy: completed > 0 ? Math.round((correct / completed) * 100) : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch exercises",
    };
  }
};
