// Supported native languages for translations
// These are the languages users can receive translations in

export const NATIVE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "nl", name: "Dutch" },
  { code: "uk", name: "Ukrainian" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "cs", name: "Czech" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "no", name: "Norwegian" },
  { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" },
  { code: "ro", name: "Romanian" },
  { code: "hu", name: "Hungarian" },
  { code: "sk", name: "Slovak" },
  { code: "bg", name: "Bulgarian" },
] as const;

export type NativeLanguageCode = (typeof NATIVE_LANGUAGES)[number]["code"];
export type NativeLanguageName = (typeof NATIVE_LANGUAGES)[number]["name"];

/**
 * Get language name from browser language code
 * Falls back to "English" if not found
 */
export function getLanguageNameFromCode(browserLang: string): string {
  // Browser language codes can be like "en", "en-US", "pt-BR", etc.
  const primaryCode = browserLang.split("-")[0].toLowerCase();

  const language = NATIVE_LANGUAGES.find((lang) => lang.code === primaryCode);
  return language?.name ?? "English";
}

/**
 * Get language code from language name
 * Falls back to "en" if not found
 */
export function getLanguageCodeFromName(name: string): string {
  const language = NATIVE_LANGUAGES.find(
    (lang) => lang.name.toLowerCase() === name.toLowerCase()
  );
  return language?.code ?? "en";
}

/**
 * Check if a language name is valid
 */
export function isValidNativeLanguage(name: string): boolean {
  return NATIVE_LANGUAGES.some(
    (lang) => lang.name.toLowerCase() === name.toLowerCase()
  );
}
