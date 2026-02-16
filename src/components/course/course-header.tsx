"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Target, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface CourseHeaderProps {
  course: {
    language: string;
    level: string;
    textsCount: number;
    completedTexts: number;
  };
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const t = useTranslations("CourseHeader");
  const tBack = useTranslations("BackButton");

  const progressPercentage =
    course.textsCount > 0
      ? Math.round((course.completedTexts / course.textsCount) * 100)
      : 0;

  return (
    <div className='animate-fade-in mb-8'>
      <Button variant='ghost' size='sm' asChild className='group mb-4'>
        <Link href='/dashboard'>
          <ArrowLeft className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1' />
          {tBack("backToDashboard")}
        </Link>
      </Button>

      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-3 flex items-center gap-3'>
            <h1 className='text-4xl font-extrabold tracking-tight'>
              {course.language}
            </h1>
            <Badge
              variant='secondary'
              className='rounded-full px-3 text-sm font-medium'
            >
              {course.level}
            </Badge>
          </div>
          <p className='text-muted-foreground mb-5 text-lg'>
            {t("learnThrough", {
              language: course.language,
              level: course.level,
            })}
          </p>

          {/* Progress Bar */}
          <div className='mb-5 max-w-md'>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>
                {t("courseProgress")}
              </span>
              <span className='font-semibold'>
                {t("textsCompleted", {
                  completed: course.completedTexts,
                  total: course.textsCount,
                })}
              </span>
            </div>
            <div className='bg-secondary h-2.5 overflow-hidden rounded-full'>
              <div
                className={`gradient-bg h-full rounded-full transition-all duration-700 ease-out ${progressPercentage > 0 ? "animate-progress-stripe" : ""}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className='text-muted-foreground flex items-center gap-6 text-sm'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4' />
              <span>{t("textsAvailable", { count: course.textsCount })}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Target className='h-4 w-4' />
              <span>{t("complete", { percentage: progressPercentage })}</span>
            </div>
            {progressPercentage > 0 && (
              <div className='text-primary flex items-center gap-2'>
                <TrendingUp className='h-4 w-4' />
                <span className='font-medium'>{t("onTrack")}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
