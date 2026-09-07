"use server";

import { ExerciseType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { GuestText } from "@/lib/guest-storage";

interface SyncGuestDataParams {
  interests: string[];
  language?: { id: number; name: string; code: string } | null;
  level?: { id: number; name: string } | null;
  texts?: GuestText[];
}

export async function syncGuestData({
  interests,
  language,
  level,
  texts = [],
}: SyncGuestDataParams) {
  const user = await getCurrentUser();
  if (!user?.id) return { error: "Not authenticated" };
  const userId = user.id;

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { interests: true, nativeLanguage: true },
  });
  if (!dbUser) return { error: "User not found" };

  const mergedInterests = Array.from(
    new Set([...(dbUser.interests ?? []), ...interests])
  );

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { interests: mergedInterests },
      });
      if (!language || !level) return;

      // Resolve by name because localStorage can outlive seed-data IDs.
      const [sourceLanguage, courseLevel, targetLanguage] = await Promise.all([
        tx.language.findUnique({ where: { name: language.name } }),
        tx.level.findUnique({ where: { name: level.name } }),
        tx.language.findUnique({
          where: { name: dbUser.nativeLanguage || "English" },
        }),
      ]);
      if (!sourceLanguage || !courseLevel) {
        throw new Error("Guest course language or level no longer exists");
      }

      const course = await tx.course.upsert({
        where: {
          languageId_levelId: {
            languageId: sourceLanguage.id,
            levelId: courseLevel.id,
          },
        },
        create: { languageId: sourceLanguage.id, levelId: courseLevel.id },
        update: {},
      });
      await tx.user.update({
        where: { id: userId },
        data: { subscriptions: { connect: { id: course.id } } },
      });

      const dictionary = await tx.userDictionary.upsert({
        where: { userId_courseId: { userId, courseId: course.id } },
        create: { userId, courseId: course.id },
        update: {},
      });

      for (const guestText of texts) {
        const text = await tx.text.create({
          data: {
            title: guestText.title,
            content: guestText.content,
            courseId: course.id,
          },
        });

        if (guestText.exercises?.length) {
          await tx.exercise.createMany({
            data: guestText.exercises.map((exercise, orderIndex) => ({
              type: exercise.type as ExerciseType,
              question: exercise.question,
              options: exercise.options
                ? JSON.stringify(exercise.options)
                : null,
              correctAnswer: exercise.correctAnswer,
              explanation: exercise.explanation,
              content: exercise.question,
              textId: text.id,
              orderIndex,
            })),
          });

          const exercises = await tx.exercise.findMany({
            where: { textId: text.id },
            orderBy: { orderIndex: "asc" },
            select: { id: true, orderIndex: true },
          });
          for (const [index, progress] of Object.entries(
            guestText.exerciseProgress ?? {}
          )) {
            const exercise = exercises.find(
              (item) => item.orderIndex === Number(index)
            );
            if (!exercise) continue;

            await tx.userExerciseProgress.create({
              data: {
                userId,
                exerciseId: exercise.id,
                completed: true,
                correct: progress.correct,
                userAnswer: progress.userAnswer,
                attempts: progress.attempts,
                answeredAt: new Date(),
              },
            });
          }
        }

        if (guestText.completed) {
          await tx.userProgress.create({
            data: {
              userId,
              textId: text.id,
              seen: true,
              current: false,
            },
          });
        }

        if (!targetLanguage) continue;
        for (const click of guestText.translationClicks ?? []) {
          const original = click.word.toLowerCase();
          let word = await tx.word.findFirst({
            where: { dictionaryId: dictionary.id, original },
          });

          if (word) {
            word = await tx.word.update({
              where: { id: word.id },
              data: {
                lookupCount: { increment: click.count },
                lastSeenAt: new Date(),
                consecutiveNoClicks: 0,
              },
            });
          } else {
            word = await tx.word.create({
              data: {
                original,
                translation: click.translation,
                fromLanguageId: sourceLanguage.id,
                toLanguageId: targetLanguage.id,
                dictionaryId: dictionary.id,
                lookupCount: click.count,
                lastSeenAt: new Date(),
              },
            });
          }

          await tx.wordTextAppearance.upsert({
            where: { wordId_textId: { wordId: word.id, textId: text.id } },
            create: { wordId: word.id, textId: text.id, clicked: true },
            update: { clicked: true },
          });
        }
      }
    });
  } catch (error) {
    console.error("Failed to migrate guest learning data:", error);
    return { error: "Failed to transfer guest learning data" };
  }

  return { success: true };
}
