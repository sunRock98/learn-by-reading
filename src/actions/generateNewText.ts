"use server";

import { generateText } from "@/api/openai/generateText";
import { generateImage } from "@/api/openai/generateImage";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MasteryLevel } from "@prisma/client";

interface GenerateNewTextParams {
  courseId: number;
  languageName: string;
  levelName: string;
  topic?: string;
}

interface GenerateNewTextResult {
  success: boolean;
  textId?: number;
  error?: string;
}

// Helper function to extract words from text content
function extractWordsFromText(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[.,!?;:'"()«»—–\-\n\r]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

// Helper function to calculate word priority score for reinforcement
function calculatePriorityScore(word: {
  lastSeenAt: Date;
  masteryLevel: MasteryLevel;
  lookupCount: number;
}): number {
  const daysSinceSeen =
    (Date.now() - word.lastSeenAt.getTime()) / (1000 * 60 * 60 * 24);
  const levelWeight = { LEARNING: 3, REVIEWING: 2, MASTERED: 1 };
  return (
    daysSinceSeen * levelWeight[word.masteryLevel] * (word.lookupCount + 1)
  );
}

export const generateNewText = async ({
  courseId,
  languageName,
  levelName,
  topic,
}: GenerateNewTextParams): Promise<GenerateNewTextResult> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get user's native language for translations
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { nativeLanguage: true },
    });

    const motherLanguage = userData?.nativeLanguage || "English";

    // Fetch user's dictionary words to reinforce (prioritize LEARNING and REVIEWING)
    const dictionaryWords = await db.word.findMany({
      where: {
        dictionary: {
          userId: user.id,
          courseId,
        },
        masteryLevel: {
          in: [MasteryLevel.LEARNING, MasteryLevel.REVIEWING],
        },
      },
      orderBy: { lastSeenAt: "asc" }, // Prioritize least recently seen
    });

    // Sort by priority score and take top 10 words
    const wordsToReinforce = dictionaryWords
      .sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a))
      .slice(0, 10)
      .map((w) => w.original);

    console.log("Words to reinforce in generated text:", wordsToReinforce);

    const data = await generateText({
      language: languageName,
      level: levelName,
      motherLanguage,
      topic,
      wordsToReinforce,
    });

    if (!data) {
      return { success: false, error: "Failed to generate text" };
    }

    const { text, title } = data;

    console.log("Generated text data:", { title, textLength: text?.length });

    // Generate illustration in The New Yorker style
    const imageUrl = await generateImage({
      title: title || "Untitled",
      textContent: text || "",
      language: languageName,
    });

    console.log("Generated image URL:", imageUrl ? "success" : "failed");

    // Add the text to the database with image
    const newText = await db.text.create({
      data: {
        title: title || "Untitled",
        content: text || "",
        picture_url: imageUrl,
        course: { connect: { id: courseId } },
      },
    });

    // Create WordTextAppearance records for dictionary words that appear in the text
    if (dictionaryWords.length > 0 && text) {
      const textWords = extractWordsFromText(text);

      // Find all dictionary words that appear in the generated text
      const matchedWords = dictionaryWords.filter((word) =>
        textWords.includes(word.original.toLowerCase())
      );

      console.log(
        "Dictionary words found in text:",
        matchedWords.map((w) => w.original)
      );

      // Create appearance records for matched words
      if (matchedWords.length > 0) {
        await db.wordTextAppearance.createMany({
          data: matchedWords.map((word) => ({
            wordId: word.id,
            textId: newText.id,
            clicked: false,
          })),
        });

        // Update lastSeenAt for words that appeared
        await db.word.updateMany({
          where: {
            id: { in: matchedWords.map((w) => w.id) },
          },
          data: {
            lastSeenAt: new Date(),
          },
        });

        // Move LEARNING words to REVIEWING since they now appeared in a new text
        await db.word.updateMany({
          where: {
            id: { in: matchedWords.map((w) => w.id) },
            masteryLevel: MasteryLevel.LEARNING,
          },
          data: {
            masteryLevel: MasteryLevel.REVIEWING,
          },
        });
      }
    }

    return { success: true, textId: newText.id };
  } catch (error) {
    console.error("Error generating new text:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate text",
    };
  }
};
