"use server";

import { db } from "@/lib/db";
import { getLanguageCodeFromName } from "@/lib/native-languages";

export interface FastTranslationResult {
  translation: string;
  provider: "database cache" | "Azure Translator" | "fallback";
}

const AZURE_LANGUAGE_CODES: Record<string, string> = {
  zh: "zh-Hans",
};

function getAzureLanguageCode(language: string) {
  const code = getLanguageCodeFromName(language);
  return AZURE_LANGUAGE_CODES[code] ?? code;
}

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
        provider: "database cache",
      };
    }

    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;
    if (!key || !region) {
      throw new Error("Azure Translator is not configured");
    }

    const query = new URLSearchParams({
      "api-version": "3.0",
      from: getAzureLanguageCode(sourceLanguage),
      to: getAzureLanguageCode(targetLanguage),
    });
    const response = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?${query}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: word }]),
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!response.ok) {
      throw new Error(`Azure Translator request failed: ${response.status}`);
    }

    const data: Array<{ translations?: Array<{ text?: string }> }> =
      await response.json();
    const translation = data[0]?.translations?.[0]?.text?.trim();

    if (!translation) {
      throw new Error("Azure Translator returned no translation");
    }

    return { translation, provider: "Azure Translator" };
  } catch (error) {
    console.error("Translation error:", error);

    // Return a fallback
    return {
      translation: `[${word}]`,
      provider: "fallback",
    };
  }
}
