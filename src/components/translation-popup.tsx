"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, BookmarkPlus, Volume2, Loader2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fastTranslate } from "@/api/translation/fastTranslate";
import {
  addWordToDictionary,
  checkWordAndRecordClick,
} from "@/actions/dictionary";
import { useTranslations } from "next-intl";

interface TranslationPopupProps {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
  position: { x: number; y: number };
  courseId: number;
  textId?: number;
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
        const checkResult = await checkWordAndRecordClick({
          courseId,
          word,
          textId,
        });

        if (checkResult.isInDictionary && checkResult.translation) {
          setIsSaved(true);
          setTranslation({
            translation: checkResult.translation,
          });
        } else {
          const result = await fastTranslate({
            word,
            sourceLanguage,
            targetLanguage,
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
  }, [word, sourceLanguage, targetLanguage, courseId, textId, t]);

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
        textId,
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
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
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

  const popupStyle = {
    left: `${Math.min(Math.max(position.x, 160), window.innerWidth - 160)}px`,
    top: `${position.y - 10}px`,
    transform: "translate(-50%, -100%)",
  };

  return (
    <>
      <div
        className='bg-foreground/5 fixed inset-0 z-40 backdrop-blur-[2px]'
        onClick={onClose}
      />
      <div
        className='glass-strong animate-scale-in fixed z-50 w-80 rounded-2xl p-5 shadow-2xl'
        style={popupStyle}
      >
        {/* Accent gradient bar at top */}
        <div className='gradient-bg absolute left-4 right-4 top-0 h-0.5 rounded-full' />

        <div className='mb-3 flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='mb-1 text-xl font-bold'>{word}</h3>
            {translation?.pronunciation && (
              <p className='text-muted-foreground text-sm'>
                {translation.pronunciation}
              </p>
            )}
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={onClose}
            className='hover:bg-destructive/10 hover:text-destructive rounded-full'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='relative'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
              <div className='bg-primary/10 absolute inset-0 h-8 w-8 animate-ping rounded-full' />
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            <div>
              {translation?.partOfSpeech && (
                <div className='mb-2 flex items-center gap-2'>
                  <Badge variant='outline' className='rounded-full text-xs'>
                    {translation.partOfSpeech}
                  </Badge>
                </div>
              )}
              <p className='gradient-text text-lg font-bold'>
                {translation?.translation}
              </p>
            </div>

            <div className='flex gap-2 pt-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePlayAudio}
                className='flex-1 rounded-xl'
              >
                <Volume2 className='mr-2 h-4 w-4' />
                {tCommon("listen")}
              </Button>
              <Button
                variant={isSaved ? "secondary" : "default"}
                size='sm'
                onClick={handleSaveToDictionary}
                disabled={isSaved || isSaving}
                className={`flex-1 rounded-xl ${!isSaved ? "gradient-bg border-0 text-white" : ""}`}
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
      </div>
    </>
  );
}
