"use server";

import { generateText } from "@/api/openai/generateText";
import { generateImage } from "@/api/openai/generateImage";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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

    const data = await generateText({
      language: languageName,
      level: levelName,
      motherLanguage,
      topic,
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

    return { success: true, textId: newText.id };
  } catch (error) {
    console.error("Error generating new text:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate text",
    };
  }
};
