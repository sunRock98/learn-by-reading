"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  RefreshCw,
  Trophy,
  Sparkles,
  Target,
} from "lucide-react";
import { MasteryLevel } from "@prisma/client";
import { useTranslations } from "next-intl";

interface Word {
  masteryLevel: MasteryLevel;
  consecutiveNoClicks?: number;
  lastSeenAt?: Date;
  lookupCount?: number;
}

interface DictionaryStatsProps {
  words: Word[];
}

export function DictionaryStats({ words }: DictionaryStatsProps) {
  const t = useTranslations("DictionaryStats");

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

  // Calculate words close to mastery (2 consecutive no-clicks)
  const closeToMastery = words.filter(
    (w) =>
      w.masteryLevel === MasteryLevel.REVIEWING &&
      (w.consecutiveNoClicks ?? 0) >= 2
  ).length;

  // Calculate words that need practice (not seen recently or clicked often)
  const needsPractice = words.filter((w) => {
    if (w.masteryLevel === MasteryLevel.MASTERED) return false;
    const daysSinceSeen = w.lastSeenAt
      ? (Date.now() - new Date(w.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    return daysSinceSeen > 3 || (w.lookupCount ?? 0) > 3;
  }).length;

  // Progress percentages for the stacked bar
  const learningPercent =
    words.length > 0 ? (stats.learning / words.length) * 100 : 0;
  const reviewingPercent =
    words.length > 0 ? (stats.reviewing / words.length) * 100 : 0;
  const masteredPercent =
    words.length > 0 ? (stats.mastered / words.length) * 100 : 0;

  return (
    <div className='mb-8 space-y-4'>
      {/* Main stats cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-sm'>
                  {t("totalWords")}
                </p>
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
                <p className='text-muted-foreground text-sm'>{t("learning")}</p>
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
                <p className='text-muted-foreground text-sm'>
                  {t("reviewing")}
                </p>
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
                <p className='text-muted-foreground text-sm'>{t("mastered")}</p>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.mastered}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {masteryPercentage}% {t("ofTotal")}
                </p>
              </div>
              <Trophy className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress visualization and practice recommendations */}
      {words.length > 0 && (
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Mastery Progress Bar */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Target className='h-4 w-4' />
                {t("masteryProgress")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {/* Stacked progress bar */}
                <div className='flex h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='bg-yellow-500 transition-all duration-500'
                    style={{ width: `${learningPercent}%` }}
                  />
                  <div
                    className='bg-blue-500 transition-all duration-500'
                    style={{ width: `${reviewingPercent}%` }}
                  />
                  <div
                    className='bg-green-500 transition-all duration-500'
                    style={{ width: `${masteredPercent}%` }}
                  />
                </div>

                {/* Legend */}
                <div className='flex flex-wrap gap-4 text-xs'>
                  <div className='flex items-center gap-1'>
                    <div className='h-3 w-3 rounded-full bg-yellow-500' />
                    <span>
                      {t("learning")} ({stats.learning})
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='h-3 w-3 rounded-full bg-blue-500' />
                    <span>
                      {t("reviewing")} ({stats.reviewing})
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='h-3 w-3 rounded-full bg-green-500' />
                    <span>
                      {t("mastered")} ({stats.mastered})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Recommendations */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Sparkles className='h-4 w-4' />
                {t("practiceInsights")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {closeToMastery > 0 && (
                  <div className='flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-950'>
                    <Trophy className='h-5 w-5 text-green-600' />
                    <div>
                      <p className='text-sm font-medium text-green-800 dark:text-green-200'>
                        {t("almostMastered", { count: closeToMastery })}
                      </p>
                      <p className='text-xs text-green-600 dark:text-green-400'>
                        {t("almostMasteredHint")}
                      </p>
                    </div>
                  </div>
                )}

                {needsPractice > 0 && (
                  <div className='flex items-center gap-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950'>
                    <RefreshCw className='h-5 w-5 text-yellow-600' />
                    <div>
                      <p className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
                        {t("needsPractice", { count: needsPractice })}
                      </p>
                      <p className='text-xs text-yellow-600 dark:text-yellow-400'>
                        {t("needsPracticeHint")}
                      </p>
                    </div>
                  </div>
                )}

                {needsPractice === 0 && closeToMastery === 0 && (
                  <div className='flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
                    <Sparkles className='h-5 w-5 text-blue-600' />
                    <div>
                      <p className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                        {t("keepReading")}
                      </p>
                      <p className='text-xs text-blue-600 dark:text-blue-400'>
                        {t("keepReadingHint")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
