"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, GraduationCap, RefreshCw, Trophy } from "lucide-react";
import { MasteryLevel } from "@prisma/client";

interface Word {
  masteryLevel: MasteryLevel;
}

interface DictionaryStatsProps {
  words: Word[];
}

export function DictionaryStats({ words }: DictionaryStatsProps) {
  const stats = {
    total: words.length,
    learning: words.filter((w) => w.masteryLevel === MasteryLevel.LEARNING)
      .length,
    reviewing: words.filter((w) => w.masteryLevel === MasteryLevel.REVIEWING)
      .length,
    mastered: words.filter((w) => w.masteryLevel === MasteryLevel.MASTERED)
      .length,
  };

  const masteryPercentage =
    words.length > 0 ? Math.round((stats.mastered / words.length) * 100) : 0;

  return (
    <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-muted-foreground text-sm'>Total Words</p>
              <p className='text-2xl font-bold'>{stats.total}</p>
            </div>
            <BookOpen className='text-primary h-8 w-8' />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-muted-foreground text-sm'>Learning</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {stats.learning}
              </p>
            </div>
            <GraduationCap className='h-8 w-8 text-yellow-600' />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-muted-foreground text-sm'>Reviewing</p>
              <p className='text-2xl font-bold text-blue-600'>
                {stats.reviewing}
              </p>
            </div>
            <RefreshCw className='h-8 w-8 text-blue-600' />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-muted-foreground text-sm'>Mastered</p>
              <p className='text-2xl font-bold text-green-600'>
                {stats.mastered}
              </p>
              <p className='text-muted-foreground text-xs'>
                {masteryPercentage}% of total
              </p>
            </div>
            <Trophy className='h-8 w-8 text-green-600' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
