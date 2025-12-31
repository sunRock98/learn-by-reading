"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Volume2, Trash2, Star, Search, BookOpen } from "lucide-react";
import {
  removeWordFromDictionary,
  updateWordMastery,
} from "@/actions/dictionary";
import { MasteryLevel } from "@prisma/client";

interface Word {
  id: number;
  original: string;
  translation: string;
  lookupCount: number;
  lastSeenAt: Date;
  masteryLevel: MasteryLevel;
  createdAt: Date;
  languageFrom: { name: string };
  languageTo: { name: string };
  dictionary: {
    course: {
      language: { name: string };
      level: { name: string };
    };
  };
}

interface DictionaryGridProps {
  words: Word[];
}

export function DictionaryGrid({ words: initialWords }: DictionaryGridProps) {
  const [words, setWords] = useState(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<MasteryLevel | "all">("all");

  const filteredWords = words.filter((word) => {
    const matchesSearch =
      word.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || word.masteryLevel === filter;
    return matchesSearch && matchesFilter;
  });

  const handlePlayAudio = useCallback((word: string, language: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      const langCode = language.toLowerCase().slice(0, 2);
      const voices = speechSynthesis.getVoices();
      const voice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langCode)
      );
      if (voice) {
        utterance.voice = voice;
      }
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleToggleMastered = useCallback(
    async (id: number, currentLevel: MasteryLevel) => {
      const newLevel =
        currentLevel === MasteryLevel.MASTERED
          ? MasteryLevel.LEARNING
          : MasteryLevel.MASTERED;

      setWords((prev) =>
        prev.map((w) => (w.id === id ? { ...w, masteryLevel: newLevel } : w))
      );

      await updateWordMastery({ wordId: id, masteryLevel: newLevel });
    },
    []
  );

  const handleDelete = useCallback(async (id: number) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    await removeWordFromDictionary({ wordId: id });
  }, []);

  const getMasteryColor = (level: MasteryLevel) => {
    switch (level) {
      case MasteryLevel.LEARNING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case MasteryLevel.REVIEWING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case MasteryLevel.MASTERED:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      default:
        return "";
    }
  };

  if (words.length === 0) {
    return (
      <Card className='p-12'>
        <div className='flex flex-col items-center justify-center text-center'>
          <BookOpen className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>No words yet</h3>
          <p className='text-muted-foreground max-w-md'>
            Start reading texts and click on words to add them to your
            dictionary.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Search and filter */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search words...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
        <div className='flex gap-2'>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size='sm'
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === MasteryLevel.LEARNING ? "default" : "outline"}
            size='sm'
            onClick={() => setFilter(MasteryLevel.LEARNING)}
          >
            Learning
          </Button>
          <Button
            variant={filter === MasteryLevel.REVIEWING ? "default" : "outline"}
            size='sm'
            onClick={() => setFilter(MasteryLevel.REVIEWING)}
          >
            Reviewing
          </Button>
          <Button
            variant={filter === MasteryLevel.MASTERED ? "default" : "outline"}
            size='sm'
            onClick={() => setFilter(MasteryLevel.MASTERED)}
          >
            Mastered
          </Button>
        </div>
      </div>

      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>
          {filteredWords.length} words
          {filter !== "all" && ` (${filter.toLowerCase()})`}
        </h2>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredWords.map((word) => (
          <Card key={word.id} className='p-5 transition-shadow hover:shadow-lg'>
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <h3 className='text-xl font-bold'>{word.original}</h3>
                  {word.masteryLevel === MasteryLevel.MASTERED && (
                    <Star className='h-4 w-4 fill-yellow-500 text-yellow-500' />
                  )}
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleToggleMastered(word.id, word.masteryLevel)}
              >
                <Star
                  className={`h-4 w-4 ${word.masteryLevel === MasteryLevel.MASTERED ? "fill-yellow-500 text-yellow-500" : ""}`}
                />
              </Button>
            </div>

            <div className='mb-4 space-y-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge className={getMasteryColor(word.masteryLevel)}>
                  {word.masteryLevel.charAt(0) +
                    word.masteryLevel.slice(1).toLowerCase()}
                </Badge>
                <Badge variant='secondary'>
                  {word.dictionary.course.language.name}
                </Badge>
              </div>

              <p className='text-lg font-semibold'>{word.translation}</p>

              <div className='text-muted-foreground flex items-center justify-between text-xs'>
                <span>Looked up {word.lookupCount} times</span>
                <span>
                  Added {new Date(word.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  handlePlayAudio(word.original, word.languageFrom.name)
                }
                className='flex-1'
              >
                <Volume2 className='mr-2 h-4 w-4' />
                Listen
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleDelete(word.id)}
                className='text-destructive'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
