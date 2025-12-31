"use server";

import { db } from "@/lib/db";

export interface FastTranslationResult {
  translation: string;
}

// Language code mapping
const LANGUAGE_CODES: Record<string, string> = {
  English: "en",
  Russian: "ru",
  Spanish: "es",
  French: "fr",
  German: "de",
  Chinese: "zh",
  Japanese: "ja",
  Portuguese: "pt",
  Korean: "ko",
  Italian: "it",
  Arabic: "ar",
  Dutch: "nl",
  Polish: "pl",
  Turkish: "tr",
  Swedish: "sv",
  Norwegian: "no",
  Danish: "da",
  Finnish: "fi",
  Greek: "el",
  Hebrew: "he",
  Hindi: "hi",
  Thai: "th",
  Vietnamese: "vi",
  Indonesian: "id",
  Malay: "ms",
  Tagalog: "tl",
  Ukrainian: "uk",
  Czech: "cs",
  Hungarian: "hu",
  Romanian: "ro",
  Bulgarian: "bg",
  Croatian: "hr",
  Slovak: "sk",
  Slovenian: "sl",
  Estonian: "et",
  Latvian: "lv",
  Lithuanian: "lt",
  Maltese: "mt",
  Icelandic: "is",
  Irish: "ga",
  Welsh: "cy",
  Basque: "eu",
  Catalan: "ca",
  Galician: "gl",
};

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
    // Get language codes
    const sourceCode =
      LANGUAGE_CODES[sourceLanguage] || sourceLanguage.toLowerCase();
    const targetCode =
      LANGUAGE_CODES[targetLanguage] || targetLanguage.toLowerCase();

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

    // Use Google Translate unofficial API (free)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(word)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data[0] || !data[0][0] || !data[0][0][0]) {
      throw new Error("Invalid translation response");
    }

    const translation = data[0][0][0];

    return { translation };
  } catch (error) {
    console.error("Fast translation error:", error);

    // Return a fallback translation
    return {
      translation: `[${word}]`,
    };
  }
}
