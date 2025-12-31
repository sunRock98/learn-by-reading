"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MasteryLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface AddWordToDictionaryProps {
  courseId: number;
  original: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export async function addWordToDictionary({
  courseId,
  original,
  translation,
  sourceLanguage,
  targetLanguage,
}: AddWordToDictionaryProps) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Get language IDs
    const [fromLanguage, toLanguage] = await Promise.all([
      db.language.findFirst({ where: { name: sourceLanguage } }),
      db.language.findFirst({ where: { name: targetLanguage } }),
    ]);

    if (!fromLanguage || !toLanguage) {
      return { success: false, error: "Language not found" };
    }

    // Find or create the user's dictionary for this course
    let userDictionary = await db.userDictionary.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!userDictionary) {
      userDictionary = await db.userDictionary.create({
        data: {
          userId: user.id,
          courseId,
        },
      });
    }

    // Check if the word already exists in the user's dictionary
    const existingWord = await db.word.findFirst({
      where: {
        original: original.toLowerCase(),
        dictionaryId: userDictionary.id,
      },
    });

    if (existingWord) {
      // Update existing word (increment lookup count, update last seen)
      await db.word.update({
        where: { id: existingWord.id },
        data: {
          lookupCount: { increment: 1 },
          lastSeenAt: new Date(),
        },
      });
      return { success: true, message: "Word updated in dictionary" };
    }

    // Add new word to dictionary
    await db.word.create({
      data: {
        original: original.toLowerCase(),
        translation,
        fromLanguageId: fromLanguage.id,
        toLanguageId: toLanguage.id,
        dictionaryId: userDictionary.id,
        lookupCount: 1,
        lastSeenAt: new Date(),
        masteryLevel: MasteryLevel.LEARNING,
      },
    });

    revalidatePath(`/course/${courseId}`);
    revalidatePath("/dictionary");

    return { success: true, message: "Word added to dictionary" };
  } catch (error) {
    console.error("Error adding word to dictionary:", error);
    return { success: false, error: "Failed to add word to dictionary" };
  }
}

interface RemoveWordFromDictionaryProps {
  wordId: number;
}

export async function removeWordFromDictionary({
  wordId,
}: RemoveWordFromDictionaryProps) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Verify the word belongs to the user's dictionary
    const word = await db.word.findFirst({
      where: {
        id: wordId,
        dictionary: {
          userId: user.id,
        },
      },
      include: {
        dictionary: true,
      },
    });

    if (!word) {
      return { success: false, error: "Word not found" };
    }

    await db.word.delete({
      where: { id: wordId },
    });

    revalidatePath(`/course/${word.dictionary.courseId}`);
    revalidatePath("/dictionary");

    return { success: true, message: "Word removed from dictionary" };
  } catch (error) {
    console.error("Error removing word from dictionary:", error);
    return { success: false, error: "Failed to remove word from dictionary" };
  }
}

interface UpdateWordMasteryProps {
  wordId: number;
  masteryLevel: MasteryLevel;
}

export async function updateWordMastery({
  wordId,
  masteryLevel,
}: UpdateWordMasteryProps) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Verify the word belongs to the user's dictionary
    const word = await db.word.findFirst({
      where: {
        id: wordId,
        dictionary: {
          userId: user.id,
        },
      },
      include: {
        dictionary: true,
      },
    });

    if (!word) {
      return { success: false, error: "Word not found" };
    }

    await db.word.update({
      where: { id: wordId },
      data: { masteryLevel },
    });

    revalidatePath(`/course/${word.dictionary.courseId}`);
    revalidatePath("/dictionary");

    return { success: true, message: "Mastery level updated" };
  } catch (error) {
    console.error("Error updating mastery level:", error);
    return { success: false, error: "Failed to update mastery level" };
  }
}

export async function getUserDictionaryWords(courseId?: number) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "User not authenticated", words: [] };
    }

    const whereClause = courseId
      ? {
          dictionary: {
            userId: user.id,
            courseId,
          },
        }
      : {
          dictionary: {
            userId: user.id,
          },
        };

    const words = await db.word.findMany({
      where: whereClause,
      include: {
        languageFrom: true,
        languageTo: true,
        dictionary: {
          include: {
            course: {
              include: {
                language: true,
                level: true,
              },
            },
          },
        },
      },
      orderBy: [{ masteryLevel: "asc" }, { lastSeenAt: "desc" }],
    });

    return { success: true, words };
  } catch (error) {
    console.error("Error fetching dictionary words:", error);
    return { success: false, error: "Failed to fetch words", words: [] };
  }
}
