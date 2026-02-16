"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AddCourseModal } from "./add-course-modal";
import { useTranslations } from "next-intl";

interface Language {
  id: number;
  name: string;
  code: string;
}

interface Level {
  id: number;
  name: string;
}

interface Course {
  id: number;
  language: { name: string };
  level: { name: string };
  texts: {
    id: number;
    title: string;
    progress: { seen: boolean }[];
  }[];
}

interface CourseGridProps {
  courses: Course[];
  languages: Language[];
  levels: Level[];
}

const LANGUAGE_GRADIENTS: Record<string, string> = {
  English: "from-[oklch(0.45_0.16_255)] to-[oklch(0.50_0.15_245)]",
  Spanish: "from-[oklch(0.55_0.14_175)] to-[oklch(0.58_0.13_165)]",
  French: "from-[oklch(0.52_0.13_220)] to-[oklch(0.55_0.12_210)]",
  German: "from-[oklch(0.48_0.14_240)] to-[oklch(0.52_0.13_230)]",
  Italian: "from-[oklch(0.56_0.13_195)] to-[oklch(0.53_0.14_185)]",
  Russian: "from-[oklch(0.50_0.15_260)] to-[oklch(0.55_0.14_250)]",
  default: "from-[oklch(0.45_0.16_255)] to-[oklch(0.50_0.15_245)]",
};

function getLanguageGradient(language: string): string {
  return LANGUAGE_GRADIENTS[language] || LANGUAGE_GRADIENTS.default;
}

export function CourseGrid({ courses, languages, levels }: CourseGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("CourseGrid");

  if (courses.length === 0) {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>{t("yourCourses")}</h2>
        </div>
        <div className='card-hover border-border bg-card/50 relative overflow-hidden rounded-2xl border border-dashed p-12'>
          <div className='bg-linear-to-br from-primary/3 absolute inset-0 to-transparent' />
          <div className='relative flex flex-col items-center justify-center text-center'>
            <div className='gradient-bg animate-bounce-subtle mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg'>
              <BookOpen className='h-7 w-7 text-white' />
            </div>
            <h3 className='mb-2 text-lg font-bold'>{t("noCourses")}</h3>
            <p className='text-muted-foreground mb-6 max-w-md'>
              {t("noCoursesDescription")}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className='gradient-bg border-0 text-white shadow-md hover:shadow-lg hover:brightness-110'
            >
              <Plus className='mr-2 h-4 w-4' />
              {t("chooseLanguage")}
            </Button>
          </div>
        </div>
        <AddCourseModal
          languages={languages}
          levels={levels}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>{t("yourCourses")}</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsModalOpen(true)}
          className='group'
        >
          <Plus className='mr-2 h-4 w-4 transition-transform group-hover:rotate-90' />
          {t("addCourse")}
        </Button>
      </div>

      <AddCourseModal
        languages={languages}
        levels={levels}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <div className='grid grid-cols-1 gap-5'>
        {courses.map((course, index) => {
          const totalTexts = course.texts.length;
          const completedTexts = course.texts.filter(
            (t) => t.progress.length > 0 && t.progress[0].seen
          ).length;
          const progress =
            totalTexts > 0 ? (completedTexts / totalTexts) * 100 : 0;
          const gradient = getLanguageGradient(course.language.name);

          return (
            <div
              key={course.id}
              className='card-hover card-shine border-border/50 bg-card group relative overflow-hidden rounded-2xl border p-6'
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Accent bar */}
              <div
                className={`bg-linear-to-b absolute left-0 top-0 h-full w-1 ${gradient} opacity-60 transition-opacity group-hover:opacity-100`}
              />

              <div className='pl-4'>
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <h3 className='text-xl font-bold'>
                        {course.language.name}
                      </h3>
                      <Badge variant='secondary' className='font-medium'>
                        {course.level.name}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground text-sm'>
                      {t("learnAtLevel", {
                        language: course.language.name,
                        level: course.level.name,
                      })}
                    </p>
                  </div>
                </div>

                <div className='mb-4 flex flex-wrap items-center gap-4 text-sm'>
                  <div className='text-muted-foreground flex items-center gap-1.5'>
                    <BookOpen className='h-4 w-4' />
                    <span>
                      {t("textsCompleted", {
                        completed: completedTexts,
                        total: totalTexts,
                      })}
                    </span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-1.5'>
                    <Clock className='h-4 w-4' />
                    <span>{t("minPerText")}</span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-1.5'>
                    <Target className='h-4 w-4' />
                    <span>{course.language.name}</span>
                  </div>
                </div>

                <div className='mb-5'>
                  <div className='mb-2 flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>
                      {t("progress")}
                    </span>
                    <span className='font-semibold'>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className='bg-secondary h-2.5 overflow-hidden rounded-full'>
                    <div
                      className={`bg-linear-to-r h-full rounded-full ${gradient} transition-all duration-700 ease-out ${progress > 0 ? "animate-progress-stripe" : ""}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <Button
                  asChild
                  className='group/btn gradient-bg w-full border-0 text-white shadow-md hover:shadow-lg hover:brightness-110'
                >
                  <Link href={`/course/${course.id}`}>
                    {completedTexts > 0
                      ? t("continueReading")
                      : t("startCourse")}
                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1' />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
