import type { ExerciseType } from "@prisma/client";

export function checkExerciseAnswer(
  type: ExerciseType,
  userAnswer: string,
  correctAnswer: string
): boolean {
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();

  switch (type) {
    case "FILL_BLANK":
      return (
        normalizedUser.replace(/[.,!?;:'"()]/g, "").trim() ===
        normalizedCorrect.replace(/[.,!?;:'"()]/g, "").trim()
      );
    case "TRANSLATION":
      return (
        normalizedUser === normalizedCorrect ||
        normalizedCorrect.includes(normalizedUser) ||
        normalizedUser.includes(normalizedCorrect)
      );
    case "SENTENCE_ORDER":
      return (
        normalizedUser.replace(/\s+/g, " ").trim() ===
        normalizedCorrect.replace(/\s+/g, " ").trim()
      );
    default:
      return normalizedUser === normalizedCorrect;
  }
}
