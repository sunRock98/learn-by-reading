"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, GraduationCap, Library, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface StatsOverviewProps {
  stats: {
    totalWords: number;
    masteredWords: number;
    coursesCount: number;
  };
}

function AnimatedCounter({
  target,
  duration = 1200,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = Date.now();
          const step = () => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
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
      value: stats.totalWords,
      isNumber: true,
      icon: BookOpen,
      change: t("inDictionary"),
      gradient: "from-[oklch(0.45_0.16_255)] to-[oklch(0.50_0.15_245)]",
      bgGlow: "oklch(0.45 0.16 255 / 0.1)",
    },
    {
      label: t("activeCourses"),
      value: stats.coursesCount,
      isNumber: true,
      icon: Library,
      change: t("languagesLearning"),
      gradient: "from-[oklch(0.52_0.13_220)] to-[oklch(0.55_0.12_210)]",
      bgGlow: "oklch(0.52 0.13 220 / 0.1)",
    },
    {
      label: t("wordsMastered"),
      value: stats.masteredWords,
      isNumber: true,
      icon: Trophy,
      change: `${masteryPercentage}% ${t("masteryRate")}`,
      gradient: "from-[oklch(0.55_0.14_175)] to-[oklch(0.58_0.13_165)]",
      bgGlow: "oklch(0.55 0.14 175 / 0.1)",
    },
    {
      label: t("keepLearning"),
      value: 0,
      displayValue: t("today"),
      isNumber: false,
      icon: GraduationCap,
      change: t("buildStreak"),
      gradient: "from-[oklch(0.56_0.13_195)] to-[oklch(0.53_0.14_185)]",
      bgGlow: "oklch(0.56 0.13 195 / 0.1)",
    },
  ];

  return (
    <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className='card-hover border-border/50 bg-card group relative overflow-hidden rounded-2xl border p-6'
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Background glow on hover */}
            <div
              className='absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100'
              style={{ background: stat.bgGlow }}
            />

            <div className='relative flex items-start justify-between'>
              <div>
                <p className='text-muted-foreground mb-2 text-sm font-medium'>
                  {stat.label}
                </p>
                <p className='mb-1.5 text-3xl font-extrabold tracking-tight'>
                  {stat.isNumber ? (
                    <AnimatedCounter target={stat.value} />
                  ) : (
                    stat.displayValue
                  )}
                </p>
                <p className='text-muted-foreground text-xs'>{stat.change}</p>
              </div>
              <div
                className={`bg-linear-to-br flex h-12 w-12 items-center justify-center rounded-2xl ${stat.gradient} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
              >
                <Icon className='h-6 w-6 text-white' />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
