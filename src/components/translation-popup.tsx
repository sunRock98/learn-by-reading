"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, BookmarkPlus, Volume2, Loader2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fastTranslate } from "@/api/translation/fastTranslate";
import {
  addWordToDictionary,
  checkWordAndRecordClick,
} from "@/actions/dictionary";
import { useTranslations } from "next-intl";
import { getLanguageCodeFromName } from "@/lib/native-languages";
import { playAzureSpeech } from "@/lib/azure-speech-client";

interface TranslationPopupProps {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
  position: { x: number; y: number };
  browserTranslation: Promise<string> | null;
  courseId: number;
  textId?: number; // Optional: which text user is reading when clicking the word
  onClose: () => void;
}

interface TranslationResult {
  translation: string;
  partOfSpeech?: string;
  pronunciation?: string;
}

const BROWSER_TRANSLATION_WAIT_MS = 750;

// Prefer a consistent regional pronunciation where the browser has one.
// Users can still fall back to any installed voice for the base language.
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
  const preferredLocales = PREFERRED_SPEECH_LOCALES[languageCode] ?? [];

  for (const locale of preferredLocales) {
    const exactMatch = voices.find(
      (voice) => voice.lang.toLowerCase() === locale.toLowerCase()
    );
    if (exactMatch) return exactMatch;
  }

  return voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
  );
}

async function getFastBrowserTranslation(
  browserTranslation: Promise<string>
): Promise<string | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      browserTranslation.catch(() => null),
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(
          () => resolve(null),
          BROWSER_TRANSLATION_WAIT_MS
        );
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function TranslationPopup({
  word,
  sourceLanguage,
  targetLanguage,
  position,
  browserTranslation,
  courseId,
  textId,
  onClose,
}: TranslationPopupProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [translation, setTranslation] = useState<TranslationResult | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations("TranslationPopup");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const initPopup = async () => {
      setIsLoading(true);
      try {
        // First, check if word is in dictionary and record the click
        // This tracks that user looked up this word (for mastery calculation)
        const checkResult = await checkWordAndRecordClick({
          courseId,
          word,
          textId,
        });

        if (checkResult.isInDictionary && checkResult.translation) {
          // Word is already saved - use saved translation and mark as saved
          console.info("[translation] result", {
            word,
            sourceLanguage,
            targetLanguage,
            provider: "saved dictionary",
            translation: checkResult.translation,
          });
          setIsSaved(true);
          setTranslation({
            translation: checkResult.translation,
          });
        } else {
          // Prefer Chrome's on-device Translator API when its language model
          // is already available. Any browser error transparently falls back
          // to the existing server translation. On first use Chrome may need
          // to download a language pack, so don't make the popup wait for it;
          // the download continues and later clicks can use it instantly.
          const localTranslation = browserTranslation
            ? await getFastBrowserTranslation(browserTranslation)
            : null;
          const result = localTranslation
            ? {
                translation: localTranslation,
                provider: "Chrome Translator API" as const,
              }
            : await fastTranslate({
                word,
                sourceLanguage,
                targetLanguage,
              });

          console.info("[translation] result", {
            word,
            sourceLanguage,
            targetLanguage,
            provider: result.provider,
            translation: result.translation,
          });
          setTranslation({
            translation: result.translation,
          });
        }
      } catch (error) {
        console.error("Translation error:", error);
        setTranslation({
          translation: t("translationUnavailable"),
        });
      } finally {
        setIsLoading(false);
      }
    };

    initPopup();
  }, [
    word,
    sourceLanguage,
    targetLanguage,
    courseId,
    textId,
    browserTranslation,
    t,
  ]);

  const handleSaveToDictionary = useCallback(async () => {
    if (!translation || isSaving) return;

    setIsSaving(true);
    try {
      const result = await addWordToDictionary({
        courseId,
        original: word,
        translation: translation.translation,
        sourceLanguage,
        targetLanguage,
        textId, // Pass textId to track word clicks per text
      });

      if (result.success) {
        setIsSaved(true);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving to dictionary:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    translation,
    isSaving,
    courseId,
    word,
    sourceLanguage,
    targetLanguage,
    textId,
    onClose,
  ]);

  const handlePlayAudio = useCallback(() => {
    const langCode = getLanguageCodeFromName(sourceLanguage);
    const preferredLocale = PREFERRED_SPEECH_LOCALES[langCode]?.[0] ?? langCode;

    const speakWithBrowser = () => {
      if (!("speechSynthesis" in window)) return;

      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = preferredLocale;
      utterance.rate = 0.85;
      const voice = getPreferredVoice(voices, langCode);
      if (voice) utterance.voice = voice;

      synth.cancel();
      synth.speak(utterance);
    };

    void playAzureSpeech(word, sourceLanguage)
      .then(() => {
        console.info("[speech] Azure Neural TTS", {
          word,
          language: sourceLanguage,
        });
      })
      .catch((error) => {
        console.warn("[speech] Azure unavailable; using browser voice", error);
        speakWithBrowser();
      });
  }, [word, sourceLanguage]);

  // Calculate position to keep popup in viewport
  const popupStyle = {
    left: `${Math.min(Math.max(position.x, 160), window.innerWidth - 160)}px`,
    top: `${position.y - 10}px`,
    transform: "translate(-50%, -100%)",
  };

  return (
    <>
      <div className='fixed inset-0 z-40' onClick={onClose} />
      <Card className='fixed z-50 w-80 p-4 shadow-xl' style={popupStyle}>
        <div className='mb-3 flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='mb-1 text-xl font-bold'>{word}</h3>
            {translation?.pronunciation && (
              <p className='text-muted-foreground text-sm'>
                {translation.pronunciation}
              </p>
            )}
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
          </div>
        ) : (
          <div className='space-y-3'>
            <div>
              {translation?.partOfSpeech && (
                <div className='mb-2 flex items-center gap-2'>
                  <Badge variant='outline'>{translation.partOfSpeech}</Badge>
                </div>
              )}
              <p className='text-lg font-semibold'>
                {translation?.translation}
              </p>
            </div>

            <div className='flex gap-2 pt-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePlayAudio}
                className='flex-1 bg-transparent'
              >
                <Volume2 className='mr-2 h-4 w-4' />
                {tCommon("listen")}
              </Button>
              <Button
                variant={isSaved ? "secondary" : "default"}
                size='sm'
                onClick={handleSaveToDictionary}
                disabled={isSaved || isSaving}
                className='flex-1'
              >
                {isSaving ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : isSaved ? (
                  <Check className='mr-2 h-4 w-4' />
                ) : (
                  <BookmarkPlus className='mr-2 h-4 w-4' />
                )}
                {isSaved ? t("inDictionary") : tCommon("save")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
