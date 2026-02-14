import type { ExerciseType } from "@prisma/client";

export interface ExerciseData {
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

export interface ExerciseComponentProps {
  exercise: ExerciseData;
  onSubmit: (exerciseId: number, answer: string) => Promise<void>;
  result?: {
    correct: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null;
  disabled?: boolean;
}
