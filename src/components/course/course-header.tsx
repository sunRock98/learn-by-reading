"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Target } from "lucide-react";
import { Link } from "@/i18n/routing";

interface CourseHeaderProps {
  course: {
    language: string;
    level: string;
    textsCount: number;
    completedTexts: number;
  };
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const progressPercentage =
    course.textsCount > 0
      ? Math.round((course.completedTexts / course.textsCount) * 100)
      : 0;

  return (
    <div className='mb-8'>
      <Button variant='ghost' size='sm' asChild className='mb-4'>
        <Link href='/dashboard'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Dashboard
        </Link>
      </Button>

      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='mb-3 flex items-center gap-3'>
            <h1 className='text-4xl font-bold'>{course.language}</h1>
            <Badge variant='secondary' className='text-sm'>
              {course.level}
            </Badge>
          </div>
          <p className='text-muted-foreground mb-4 text-lg'>
            Learn {course.language} at {course.level} level through engaging
            stories
          </p>

          {/* Progress Bar */}
          <div className='mb-4 max-w-md'>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Course Progress</span>
              <span className='font-medium'>
                {course.completedTexts}/{course.textsCount} texts completed
              </span>
            </div>
            <div className='bg-muted h-2 overflow-hidden rounded-full'>
              <div
                className='bg-primary h-full transition-all duration-300'
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className='text-muted-foreground flex items-center gap-6 text-sm'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4' />
              <span>{course.textsCount} texts available</span>
            </div>
            <div className='flex items-center gap-2'>
              <Target className='h-4 w-4' />
              <span>{progressPercentage}% complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
