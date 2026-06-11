"use client";

import { useState } from "react";
import { BookOpen, PanelsTopLeft } from "lucide-react";
import { MasteryLevel } from "@prisma/client";
import { useTranslations } from "next-intl";

import type { DictionaryWord } from "@/actions/dictionary";
import { DictionaryGrid } from "@/components/dictionary-grid";
import { DictionaryPractice } from "@/components/dictionary-practice";
import { DictionaryStats } from "@/components/dictionary-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DictionaryStudyProps {
  words: DictionaryWord[];
}

export function DictionaryStudy({ words: initialWords }: DictionaryStudyProps) {
  const t = useTranslations("DictionaryPractice");
  const [words, setWords] = useState(initialWords);

  const handleWordMasteryChange = (
    wordId: number,
    masteryLevel: MasteryLevel
  ) => {
    setWords((currentWords) =>
      currentWords.map((word) =>
        word.id === wordId ? { ...word, masteryLevel } : word
      )
    );
  };

  const handleWordsChange = (nextWords: DictionaryWord[]) => {
    setWords(nextWords);
  };

  return (
    <>
      <DictionaryStats words={words} />

      <Tabs defaultValue='browse' className='w-full'>
        <TabsList className='mb-6'>
          <TabsTrigger value='browse'>
            <BookOpen className='h-4 w-4' />
            {t("browse")}
          </TabsTrigger>
          <TabsTrigger value='practice'>
            <PanelsTopLeft className='h-4 w-4' />
            {t("practice")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='browse'>
          <DictionaryGrid words={words} onWordsChange={handleWordsChange} />
        </TabsContent>

        <TabsContent value='practice'>
          <DictionaryPractice
            words={words}
            onWordMasteryChange={handleWordMasteryChange}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
