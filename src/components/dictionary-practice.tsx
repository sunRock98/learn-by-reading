"use client";

import { useMemo, useState } from "react";
import { MasteryLevel } from "@prisma/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  RotateCcw,
  Shuffle,
  Volume2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { updateWordMastery } from "@/actions/dictionary";
import type { DictionaryWord } from "@/actions/dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DictionaryPracticeProps {
  words: DictionaryWord[];
  onWordMasteryChange: (wordId: number, masteryLevel: MasteryLevel) => void;
}

type PracticeMode = "flashcard" | "reverse";

function rotateWords(words: DictionaryWord[]) {
  return [...words].sort((a, b) => {
    if (a.masteryLevel !== b.masteryLevel) {
      return a.masteryLevel.localeCompare(b.masteryLevel);
    }

    return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
  });
}

function shuffleWords(words: DictionaryWord[]) {
  return [...words].sort(() => Math.random() - 0.5);
}

export function DictionaryPractice({
  words,
  onWordMasteryChange,
}: DictionaryPracticeProps) {
  const t = useTranslations("DictionaryPractice");
  const tCommon = useTranslations("common");
  const [mode, setMode] = useState<PracticeMode>("flashcard");
  const [studyWords, setStudyWords] = useState(() => rotateWords(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const [knownCount, setKnownCount] = useState(0);

  const currentWord = studyWords[currentIndex];
  const progress =
    studyWords.length > 0
      ? Math.round((reviewedIds.size / studyWords.length) * 100)
      : 0;

  const frontLabel = mode === "flashcard" ? t("original") : t("translation");
  const backLabel = mode === "flashcard" ? t("translation") : t("original");
  const frontText =
    mode === "flashcard" ? currentWord?.original : currentWord?.translation;
  const backText =
    mode === "flashcard" ? currentWord?.translation : currentWord?.original;
  const sourceLanguage =
    mode === "flashcard"
      ? currentWord?.languageFrom.name
      : currentWord?.languageTo.name;

  const learningCount = useMemo(
    () =>
      words.filter((word) => word.masteryLevel !== MasteryLevel.MASTERED)
        .length,
    [words]
  );

  const handlePlayAudio = (text: string, language: string) => {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = language.toLowerCase().slice(0, 2);
    const voice = speechSynthesis
      .getVoices()
      .find((item) => item.lang.toLowerCase().startsWith(langCode));

    if (voice) {
      utterance.voice = voice;
    }

    speechSynthesis.speak(utterance);
  };

  const moveToCard = (index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    moveToCard(currentIndex === 0 ? studyWords.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    moveToCard(currentIndex === studyWords.length - 1 ? 0 : currentIndex + 1);
  };

  const handleShuffle = () => {
    setStudyWords((current) => shuffleWords(current));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setStudyWords(rotateWords(words));
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedIds(new Set());
    setKnownCount(0);
  };

  const handleRate = async (masteryLevel: MasteryLevel) => {
    if (!currentWord) return;

    if (masteryLevel === MasteryLevel.MASTERED) {
      setKnownCount((count) => count + 1);
    }

    setReviewedIds((current) => new Set(current).add(currentWord.id));
    onWordMasteryChange(currentWord.id, masteryLevel);
    await updateWordMastery({ wordId: currentWord.id, masteryLevel });
    handleNext();
  };

  if (studyWords.length === 0) {
    return (
      <Card className='p-12'>
        <div className='flex flex-col items-center justify-center text-center'>
          <Eye className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>{t("emptyTitle")}</h3>
          <p className='text-muted-foreground max-w-md'>
            {t("emptyDescription")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>{t("title")}</h2>
          <p className='text-muted-foreground text-sm'>
            {t("subtitle", { count: learningCount })}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Tabs
            value={mode}
            onValueChange={(value) => {
              setMode(value as PracticeMode);
              setIsFlipped(false);
            }}
          >
            <TabsList>
              <TabsTrigger value='flashcard'>{t("flashcards")}</TabsTrigger>
              <TabsTrigger value='reverse'>{t("reverseCards")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant='outline' size='icon-sm' onClick={handleShuffle}>
            <Shuffle className='h-4 w-4' />
            <span className='sr-only'>{t("shuffle")}</span>
          </Button>
          <Button variant='outline' size='icon-sm' onClick={handleRestart}>
            <RotateCcw className='h-4 w-4' />
            <span className='sr-only'>{t("restart")}</span>
          </Button>
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-[1fr_220px]'>
        <Card className='min-h-[360px] p-4 sm:p-6'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <Badge variant='secondary'>
              {t("cardCount", {
                current: currentIndex + 1,
                total: studyWords.length,
              })}
            </Badge>
            <Badge>{currentWord.dictionary.course.language.name}</Badge>
          </div>

          <button
            type='button'
            aria-pressed={isFlipped}
            onClick={() => setIsFlipped((value) => !value)}
            className='focus-visible:ring-ring/50 group block min-h-[230px] w-full rounded-lg text-center [perspective:1200px] focus-visible:outline-none focus-visible:ring-[3px]'
          >
            <span
              className={`relative block min-h-[230px] rounded-lg transition-transform duration-500 ease-out [transform-style:preserve-3d] ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <span className='border-border bg-muted/30 group-hover:bg-muted/50 absolute inset-0 flex flex-col items-center justify-center rounded-lg border p-6 [backface-visibility:hidden]'>
                <span className='text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide'>
                  {frontLabel}
                </span>
                <span className='text-3xl font-bold sm:text-4xl'>
                  {frontText}
                </span>
                <span className='text-muted-foreground mt-5 inline-flex items-center gap-2 text-sm'>
                  <Eye className='h-4 w-4' />
                  {t("showAnswer")}
                </span>
              </span>

              <span className='border-primary/30 bg-primary/10 absolute inset-0 flex flex-col items-center justify-center rounded-lg border p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]'>
                <span className='text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide'>
                  {backLabel}
                </span>
                <span className='text-3xl font-bold sm:text-4xl'>
                  {backText}
                </span>
                <span className='text-muted-foreground mt-5 inline-flex items-center gap-2 text-sm'>
                  <Eye className='h-4 w-4' />
                  {t("hideAnswer")}
                </span>
              </span>
            </span>
          </button>

          <div className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex gap-2'>
              <Button variant='outline' size='icon-sm' onClick={handlePrevious}>
                <ArrowLeft className='h-4 w-4' />
                <span className='sr-only'>{tCommon("previous")}</span>
              </Button>
              <Button variant='outline' size='icon-sm' onClick={handleNext}>
                <ArrowRight className='h-4 w-4' />
                <span className='sr-only'>{tCommon("next")}</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  handlePlayAudio(frontText ?? "", sourceLanguage ?? "")
                }
              >
                <Volume2 className='h-4 w-4' />
                {tCommon("listen")}
              </Button>
            </div>

            <div className='grid grid-cols-3 gap-2 sm:flex'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleRate(MasteryLevel.LEARNING)}
              >
                <X className='h-4 w-4' />
                {t("forgot")}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleRate(MasteryLevel.REVIEWING)}
              >
                {t("almost")}
              </Button>
              <Button
                size='sm'
                onClick={() => handleRate(MasteryLevel.MASTERED)}
              >
                <Check className='h-4 w-4' />
                {t("knowIt")}
              </Button>
            </div>
          </div>
        </Card>

        <div className='space-y-4'>
          <Card className='p-4'>
            <p className='text-muted-foreground text-sm'>
              {t("sessionProgress")}
            </p>
            <p className='mt-1 text-2xl font-bold'>{progress}%</p>
            <Progress value={progress} className='mt-3' />
            <p className='text-muted-foreground mt-2 text-xs'>
              {t("reviewed", {
                reviewed: reviewedIds.size,
                total: studyWords.length,
              })}
            </p>
          </Card>

          <Card className='p-4'>
            <p className='text-muted-foreground text-sm'>
              {t("knownThisRound")}
            </p>
            <p className='mt-1 text-2xl font-bold'>{knownCount}</p>
            <p className='text-muted-foreground mt-2 text-xs'>
              {t("knownHint")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
