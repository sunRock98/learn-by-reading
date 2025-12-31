"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Word {
  id: number;
  original: string;
  translation: string;
  masteryLevel: string;
  languageFrom: { name: string };
  languageTo: { name: string };
}

interface RecentWordsProps {
  words: Word[];
}

export function RecentWords({ words }: RecentWordsProps) {
  const getMasteryColor = (level: string) => {
    switch (level) {
      case "LEARNING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "REVIEWING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "MASTERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      default:
        return "";
    }
  };

  if (words.length === 0) {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Recent Words</h2>
        </div>
        <Card className='p-8'>
          <div className='flex flex-col items-center justify-center text-center'>
            <BookOpen className='text-muted-foreground mb-3 h-10 w-10' />
            <h3 className='mb-1 text-sm font-semibold'>No words yet</h3>
            <p className='text-muted-foreground text-xs'>
              Words you translate will appear here
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-bold'>Recent Words</h2>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/dictionary'>
            View all
            <ArrowRight className='ml-1 h-4 w-4' />
          </Link>
        </Button>
      </div>

      <Card className='divide-y'>
        {words.map((word) => (
          <div key={word.id} className='p-4'>
            <div className='mb-1 flex items-center justify-between'>
              <span className='font-semibold'>{word.original}</span>
              <Badge
                className={`text-xs ${getMasteryColor(word.masteryLevel)}`}
              >
                {word.masteryLevel.charAt(0) +
                  word.masteryLevel.slice(1).toLowerCase()}
              </Badge>
            </div>
            <p className='text-muted-foreground text-sm'>{word.translation}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
