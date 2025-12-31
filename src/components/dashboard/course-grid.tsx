"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, Plus } from "lucide-react";
import Link from "next/link";

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
}

export function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div>
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>Your Courses</h2>
        </div>
        <Card className='p-12'>
          <div className='flex flex-col items-center justify-center text-center'>
            <BookOpen className='text-muted-foreground mb-4 h-12 w-12' />
            <h3 className='mb-2 text-lg font-semibold'>No courses yet</h3>
            <p className='text-muted-foreground mb-4 max-w-md'>
              Start your language learning journey by selecting a language and
              level.
            </p>
            <Button asChild>
              <Link href='/languages'>
                <Plus className='mr-2 h-4 w-4' />
                Choose a Language
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Your Courses</h2>
        <Button variant='outline' size='sm' asChild>
          <Link href='/languages'>
            <Plus className='mr-2 h-4 w-4' />
            Add Course
          </Link>
        </Button>
      </div>

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
                    Learn {course.language.name} at {course.level.name} level
                  </p>
                </div>
              </div>

              <div className='mb-4 space-y-3'>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <BookOpen className='h-4 w-4' />
                  <span>
                    {completedTexts} / {totalTexts} texts completed
                  </span>
                </div>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Clock className='h-4 w-4' />
                  <span>2-3 min per text</span>
                </div>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Target className='h-4 w-4' />
                  <span>{course.language.name}</span>
                </div>
              </div>

              <div className='mb-4'>
                <div className='mb-2 flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Progress</span>
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
                  {completedTexts > 0 ? "Continue Reading" : "Start Course"}
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
