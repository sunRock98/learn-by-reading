"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, GraduationCap, Library, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface StatsOverviewProps {
  stats: {
    totalWords: number;
    masteredWords: number;
    coursesCount: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const t = useTranslations("StatsOverview");

  const masteryPercentage =
    stats.totalWords > 0
      ? Math.round((stats.masteredWords / stats.totalWords) * 100)
      : 0;

  const statCards = [
    {
      label: t("wordsLearned"),
      value: stats.totalWords.toString(),
      icon: BookOpen,
      change: t("inDictionary"),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("activeCourses"),
      value: stats.coursesCount.toString(),
      icon: Library,
      change: t("languagesLearning"),
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      label: t("wordsMastered"),
      value: stats.masteredWords.toString(),
      icon: Trophy,
      change: `${masteryPercentage}% ${t("masteryRate")}`,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
    {
      label: t("keepLearning"),
      value: t("today"),
      icon: GraduationCap,
      change: t("buildStreak"),
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/10",
    },
  ];

  return (
    <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className='p-6'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-muted-foreground mb-1 text-sm'>
                  {stat.label}
                </p>
                <p className='mb-1 text-3xl font-bold'>{stat.value}</p>
                <p className='text-muted-foreground text-xs'>{stat.change}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
