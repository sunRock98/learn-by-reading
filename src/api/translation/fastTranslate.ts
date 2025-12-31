"use server";

import OpenAI from "openai";
import { db } from "@/lib/db";

export interface FastTranslationResult {
  translation: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function fastTranslate({
  word,
  sourceLanguage,
  targetLanguage,
}: {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
}): Promise<FastTranslationResult> {
  try {
    // Check if we have a cached translation in the database
    const cachedTranslation = await db.word.findFirst({
      where: {
        original: word.toLowerCase(),
        languageFrom: {
          name: sourceLanguage,
        },
        languageTo: {
          name: targetLanguage,
        },
      },
      select: {
        translation: true,
      },
    });

    if (cachedTranslation) {
      return {
        translation: cachedTranslation.translation,
      };
    }

    // Use OpenAI for translation
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translator. Translate the given word or phrase from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translation, nothing else. No explanations, no quotes, just the translated word(s).`,
        },
        {
          role: "user",
          content: word,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const translation = response.choices[0]?.message?.content?.trim();

    if (!translation) {
      throw new Error("No translation in response");
    }

    return { translation };
  } catch (error) {
    console.error("Translation error:", error);

    // Return a fallback
    return {
      translation: `[${word}]`,
    };
  }
}
