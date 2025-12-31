"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, BookmarkPlus, Volume2, Loader2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fastTranslate } from "@/api/translation/fastTranslate";
import { addWordToDictionary } from "@/actions/dictionary";
import { useTranslations } from "next-intl";

interface TranslationPopupProps {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
  position: { x: number; y: number };
  courseId: number;
  onClose: () => void;
}

interface TranslationResult {
  translation: string;
  partOfSpeech?: string;
  pronunciation?: string;
}

export function TranslationPopup({
  word,
  sourceLanguage,
  targetLanguage,
  position,
  courseId,
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
    const fetchTranslation = async () => {
      setIsLoading(true);
      try {
        const result = await fastTranslate({
          word,
          sourceLanguage,
          targetLanguage,
        });
        setTranslation({
          translation: result.translation,
        });
      } catch (error) {
        console.error("Translation error:", error);
        setTranslation({
          translation: t("translationUnavailable"),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [word, sourceLanguage, targetLanguage, t]);

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
    onClose,
  ]);

  const handlePlayAudio = useCallback(() => {
    // Use browser's speech synthesis for audio playback
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      // Try to find a voice for the source language
      const voices = speechSynthesis.getVoices();
      const langCode = sourceLanguage.toLowerCase().slice(0, 2);
      const voice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langCode)
      );
      if (voice) {
        utterance.voice = voice;
      }
      speechSynthesis.speak(utterance);
    }
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
                {isSaved ? t("saved") : tCommon("save")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
