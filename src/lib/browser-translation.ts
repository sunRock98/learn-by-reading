import { getLanguageCodeFromName } from "@/lib/native-languages";

type TranslationAvailability =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable";

interface BrowserTranslator {
  translate(text: string): Promise<string>;
  destroy(): void;
}

interface BrowserTranslatorConstructor {
  availability(
    options: TranslationLanguageOptions
  ): Promise<TranslationAvailability>;
  create(options: TranslationLanguageOptions): Promise<BrowserTranslator>;
}

interface TranslationLanguageOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

declare global {
  var Translator: BrowserTranslatorConstructor | undefined;
}

const translators = new Map<string, Promise<BrowserTranslator>>();

function getLanguageOptions(
  sourceLanguage: string,
  targetLanguage: string
): TranslationLanguageOptions {
  return {
    sourceLanguage: getLanguageCodeFromName(sourceLanguage),
    targetLanguage: getLanguageCodeFromName(targetLanguage),
  };
}

/**
 * Preflight the requested pair without downloading a model. Chrome may report
 * a supported pair as downloadable until this site creates it for the first
 * time, so every state except unavailable is usable.
 */
export async function isBrowserTranslationSupported(
  sourceLanguage: string,
  targetLanguage: string
): Promise<boolean> {
  if (typeof window === "undefined" || !globalThis.Translator) return false;

  try {
    const availability = await globalThis.Translator.availability(
      getLanguageOptions(sourceLanguage, targetLanguage)
    );
    // `downloadable` and `downloading` both mean this language pair is
    // supported. Calling create() from a word click starts/continues the
    // one-time language-pack download for this origin.
    return availability !== "unavailable";
  } catch {
    return false;
  }
}

/**
 * Must be called directly from a user interaction. Chrome requires transient
 * user activation when a Translator instance is created.
 */
export function translateWithBrowser(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> | null {
  const TranslatorApi = globalThis.Translator;
  if (!TranslatorApi) return null;

  const options = getLanguageOptions(sourceLanguage, targetLanguage);
  const key = `${options.sourceLanguage}:${options.targetLanguage}`;
  let translatorPromise = translators.get(key);

  try {
    if (!translatorPromise) {
      translatorPromise = TranslatorApi.create(options);
      translators.set(key, translatorPromise);
      translatorPromise.catch(() => translators.delete(key));
    }

    // Handle failures here as well as at the call site so a quickly closed
    // popup cannot leave a rejected translation promise unobserved.
    return translatorPromise
      .then((translator) => translator.translate(text))
      .catch(() => "");
  } catch {
    translators.delete(key);
    return null;
  }
}
