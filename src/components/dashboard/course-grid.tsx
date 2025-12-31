"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, Plus } from "lucide-react";
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

export function CourseGrid({ courses, languages, levels }: CourseGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("CourseGrid");

  if (courses.length === 0) {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>{t("yourCourses")}</h2>
        </div>
        <Card className='p-12'>
          <div className='flex flex-col items-center justify-center text-center'>
            <BookOpen className='text-muted-foreground mb-4 h-12 w-12' />
            <h3 className='mb-2 text-lg font-semibold'>{t("noCourses")}</h3>
            <p className='text-muted-foreground mb-4 max-w-md'>
              {t("noCoursesDescription")}
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              {t("chooseLanguage")}
            </Button>
          </div>
        </Card>
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
        >
          <Plus className='mr-2 h-4 w-4' />
          {t("addCourse")}
        </Button>
      </div>

      <AddCourseModal
        languages={languages}
        levels={levels}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <div className='grid grid-cols-1 gap-6'>
        {courses.map((course) => {
          const totalTexts = course.texts.length;
          const completedTexts = course.texts.filter(
            (t) => t.progress.length > 0 && t.progress[0].seen
          ).length;
          const progress =
            totalTexts > 0 ? (completedTexts / totalTexts) * 100 : 0;

          return (
            <Card
              key={course.id}
              className='p-6 transition-shadow hover:shadow-lg'
            >
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='text-xl font-bold'>
                      {course.language.name}
                    </h3>
                    <Badge variant='secondary'>{course.level.name}</Badge>
                  </div>
                  <p className='text-muted-foreground mb-3 text-sm'>
                    {t("learnAtLevel", {
                      language: course.language.name,
                      level: course.level.name,
                    })}
                  </p>
                </div>
              </div>

              <div className='mb-4 space-y-3'>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <BookOpen className='h-4 w-4' />
                  <span>
                    {t("textsCompleted", {
                      completed: completedTexts,
                      total: totalTexts,
                    })}
                  </span>
                </div>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Clock className='h-4 w-4' />
                  <span>{t("minPerText")}</span>
                </div>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Target className='h-4 w-4' />
                  <span>{course.language.name}</span>
                </div>
              </div>

              <div className='mb-4'>
                <div className='mb-2 flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>{t("progress")}</span>
                  <span className='font-medium'>{Math.round(progress)}%</span>
                </div>
                <div className='bg-secondary h-2 overflow-hidden rounded-full'>
                  <div
                    className='bg-primary h-full transition-all'
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Button asChild className='w-full'>
                <Link href={`/course/${course.id}`}>
                  {completedTexts > 0 ? t("continueReading") : t("startCourse")}
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
