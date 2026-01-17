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
  textId?: number; // Optional: which text user is reading when clicking the word
}

/**
 * Check if a word exists in user's dictionary and record the click.
 * This is called when user clicks a word to see translation (before saving).
 * Returns whether word is already saved and its mastery level.
 */
export async function checkWordAndRecordClick({
  courseId,
  word,
  textId,
}: {
  courseId: number;
  word: string;
  textId?: number;
}) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, isInDictionary: false };
    }

    // Find user's dictionary for this course
    const userDictionary = await db.userDictionary.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!userDictionary) {
      return { success: true, isInDictionary: false };
    }

    // Check if word exists in dictionary
    const existingWord = await db.word.findFirst({
      where: {
        original: word.toLowerCase(),
        dictionaryId: userDictionary.id,
      },
    });

    if (!existingWord) {
      return { success: true, isInDictionary: false };
    }

    // Word exists - record the click (user looked up the word)
    const updateData: {
      lookupCount: { increment: number };
      lastSeenAt: Date;
      consecutiveNoClicks: number;
      masteryLevel?: MasteryLevel;
    } = {
      lookupCount: { increment: 1 },
      lastSeenAt: new Date(),
      consecutiveNoClicks: 0, // Reset since user clicked
    };

    // If word was MASTERED but user clicked it, demote to REVIEWING (they forgot)
    if (existingWord.masteryLevel === MasteryLevel.MASTERED) {
      updateData.masteryLevel = MasteryLevel.REVIEWING;
    }

    await db.word.update({
      where: { id: existingWord.id },
      data: updateData,
    });

    // If textId provided, mark the word appearance as clicked
    if (textId) {
      await db.wordTextAppearance.upsert({
        where: {
          wordId_textId: {
            wordId: existingWord.id,
            textId,
          },
        },
        update: { clicked: true },
        create: {
          wordId: existingWord.id,
          textId,
          clicked: true,
        },
      });
    }

    return {
      success: true,
      isInDictionary: true,
      masteryLevel: existingWord.masteryLevel,
      translation: existingWord.translation,
    };
  } catch (error) {
    console.error("Error checking word:", error);
    return { success: false, isInDictionary: false };
  }
}

export async function addWordToDictionary({
  courseId,
  original,
  translation,
  sourceLanguage,
  targetLanguage,
  textId,
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
      const updateData: {
        lookupCount: { increment: number };
        lastSeenAt: Date;
        consecutiveNoClicks?: number;
        masteryLevel?: MasteryLevel;
      } = {
        lookupCount: { increment: 1 },
        lastSeenAt: new Date(),
      };

      // If user clicked on a word they had previously mastered, demote to REVIEWING
      if (existingWord.masteryLevel === MasteryLevel.MASTERED) {
        updateData.masteryLevel = MasteryLevel.REVIEWING;
        updateData.consecutiveNoClicks = 0;
      } else {
        // Reset consecutive no-clicks counter since user clicked the word
        updateData.consecutiveNoClicks = 0;
      }

      await db.word.update({
        where: { id: existingWord.id },
        data: updateData,
      });

      // If textId provided, mark the word appearance as clicked
      if (textId) {
        await db.wordTextAppearance.upsert({
          where: {
            wordId_textId: {
              wordId: existingWord.id,
              textId,
            },
          },
          update: { clicked: true },
          create: {
            wordId: existingWord.id,
            textId,
            clicked: true,
          },
        });
      }

      return { success: true, message: "Word updated in dictionary" };
    }

    // Add new word to dictionary
    const newWord = await db.word.create({
      data: {
        original: original.toLowerCase(),
        translation,
        fromLanguageId: fromLanguage.id,
        toLanguageId: toLanguage.id,
        dictionaryId: userDictionary.id,
        lookupCount: 1,
        lastSeenAt: new Date(),
        masteryLevel: MasteryLevel.LEARNING,
        consecutiveNoClicks: 0,
      },
    });

    // If textId provided, create the word appearance record
    if (textId) {
      await db.wordTextAppearance.create({
        data: {
          wordId: newWord.id,
          textId,
          clicked: true,
        },
      });
    }

    revalidatePath(`/course/${courseId}`);
    revalidatePath("/dictionary");

    return { success: true, message: "Word added to dictionary" };
  } catch (error) {
    console.error("Error adding word to dictionary:", error);
    return { success: false, error: "Failed to add word to dictionary" };
  }
}

/**
 * Updates word mastery levels when a user completes reading a text.
 * For words that appeared in the text but were not clicked:
 * - Increments consecutiveNoClicks counter
 * - If counter reaches 3, promotes word to MASTERED
 */
export async function updateWordMasteryOnTextComplete(textId: number) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    // Get all word appearances for this text that belong to the user
    const appearances = await db.wordTextAppearance.findMany({
      where: {
        textId,
        word: {
          dictionary: {
            userId: user.id,
          },
        },
      },
      include: {
        word: true,
      },
    });

    if (appearances.length === 0) {
      return { success: true, message: "No dictionary words in this text" };
    }

    // Process each word appearance
    for (const appearance of appearances) {
      if (!appearance.clicked) {
        // User didn't click on this word - they might know it!
        const newConsecutiveNoClicks = appearance.word.consecutiveNoClicks + 1;
        const shouldMaster = newConsecutiveNoClicks >= 3; // 3 texts without clicking = mastered

        await db.word.update({
          where: { id: appearance.wordId },
          data: {
            consecutiveNoClicks: newConsecutiveNoClicks,
            masteryLevel: shouldMaster
              ? MasteryLevel.MASTERED
              : MasteryLevel.REVIEWING,
          },
        });
      }
      // If clicked, the mastery was already handled in addWordToDictionary
    }

    revalidatePath("/dictionary");

    return {
      success: true,
      message: `Processed ${appearances.length} word appearances`,
    };
  } catch (error) {
    console.error("Error updating word mastery on text complete:", error);
    return { success: false, error: "Failed to update word mastery" };
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

// Types for language-grouped dictionary
export interface LanguageStats {
  total: number;
  learning: number;
  reviewing: number;
  mastered: number;
}

export interface DictionaryWord {
  id: number;
  original: string;
  translation: string;
  lookupCount: number;
  lastSeenAt: Date;
  masteryLevel: MasteryLevel;
  consecutiveNoClicks: number;
  createdAt: Date;
  languageFrom: { name: string };
  languageTo: { name: string };
  dictionary: {
    course: {
      language: { name: string };
      level: { name: string };
    };
  };
}

export interface LanguageGroup {
  languageId: number;
  languageName: string;
  languageCode: string;
  words: DictionaryWord[];
  stats: LanguageStats;
}

/**
 * Gets simplified dictionary words for a specific course (for highlighting in text)
 * Returns only the essential data needed for word highlighting
 */
export async function getDictionaryWordsForHighlighting(courseId: number) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, words: [] };
    }

    const words = await db.word.findMany({
      where: {
        dictionary: {
          userId: user.id,
          courseId,
        },
      },
      select: {
        original: true,
        masteryLevel: true,
      },
    });

    return {
      success: true,
      words: words.map((w) => ({
        original: w.original.toLowerCase(),
        masteryLevel: w.masteryLevel,
      })),
    };
  } catch (error) {
    console.error("Error fetching dictionary words for highlighting:", error);
    return { success: false, words: [] };
  }
}

export async function getUserDictionaryWordsByLanguage() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
        groups: [],
        activeLanguageId: null,
      };
    }

    // Fetch user with active course info
    const userWithCourse = await db.user.findUnique({
      where: { id: user.id },
      include: {
        activeCourse: {
          include: {
            language: true,
          },
        },
      },
    });

    // Fetch all words for the user
    const words = await db.word.findMany({
      where: {
        dictionary: {
          userId: user.id,
        },
      },
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

    // Group words by language (using the course's language)
    const languageMap = new Map<number, LanguageGroup>();

    for (const word of words) {
      const language = word.dictionary.course.language;
      const languageId = language.id;

      if (!languageMap.has(languageId)) {
        // Get language code from languageFrom since it matches the course language
        const languageCode = word.languageFrom.name.toLowerCase().slice(0, 2);
        languageMap.set(languageId, {
          languageId,
          languageName: language.name,
          languageCode,
          words: [],
          stats: { total: 0, learning: 0, reviewing: 0, mastered: 0 },
        });
      }

      const group = languageMap.get(languageId)!;
      group.words.push(word as DictionaryWord);
      group.stats.total++;

      switch (word.masteryLevel) {
        case MasteryLevel.LEARNING:
          group.stats.learning++;
          break;
        case MasteryLevel.REVIEWING:
          group.stats.reviewing++;
          break;
        case MasteryLevel.MASTERED:
          group.stats.mastered++;
          break;
      }
    }

    // Convert map to array and sort by language name
    const groups = Array.from(languageMap.values()).sort((a, b) =>
      a.languageName.localeCompare(b.languageName)
    );

    // Get active language ID from user's active course
    const activeLanguageId = userWithCourse?.activeCourse?.language?.id ?? null;

    return {
      success: true,
      groups,
      activeLanguageId,
    };
  } catch (error) {
    console.error("Error fetching dictionary words by language:", error);
    return {
      success: false,
      error: "Failed to fetch words",
      groups: [],
      activeLanguageId: null,
    };
  }
}
