import { getLanguageCodeFromName } from "@/lib/native-languages";
import { playAzureSpeech } from "@/lib/azure-speech-client";

const PREFERRED_SPEECH_LOCALES: Record<string, string[]> = {
  en: ["en-US", "en-GB"],
  es: ["es-ES", "es-MX"],
  fr: ["fr-FR", "fr-CA"],
  pt: ["pt-BR", "pt-PT"],
  de: ["de-DE"],
  it: ["it-IT"],
  ru: ["ru-RU"],
  ja: ["ja-JP"],
  ko: ["ko-KR"],
  zh: ["zh-CN", "zh-TW"],
};

function getPreferredVoice(
  voices: SpeechSynthesisVoice[],
  languageCode: string
) {
  for (const locale of PREFERRED_SPEECH_LOCALES[languageCode] ?? []) {
    const exactMatch = voices.find(
      (voice) => voice.lang.toLowerCase() === locale.toLowerCase()
    );
    if (exactMatch) return exactMatch;
  }

  return voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
  );
}

/** Plays dictionary words with the same voice strategy used in the reader. */
export async function playWordSpeech(word: string, language: string) {
  try {
    await playAzureSpeech(word, language);
    return;
  } catch (error) {
    console.warn("[speech] Azure unavailable; using browser voice", error);
  }

  if (!("speechSynthesis" in window)) return;

  const languageCode = getLanguageCodeFromName(language);
  const preferredLocale =
    PREFERRED_SPEECH_LOCALES[languageCode]?.[0] ?? languageCode;
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = preferredLocale;
  utterance.rate = 0.85;

  const voice = getPreferredVoice(synth.getVoices(), languageCode);
  if (voice) utterance.voice = voice;

  synth.cancel();
  synth.speak(utterance);
}
