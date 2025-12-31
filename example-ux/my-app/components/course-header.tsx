import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CourseHeaderProps {
  course: {
    title: string;
    description: string;
    level: string;
    language: string;
  };
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className='mb-8'>
      <Button variant='ghost' size='sm' asChild className='mb-4'>
        <Link href='/'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Courses
        </Link>
      </Button>

      <div className='flex items-start justify-between'>
        <div>
          <div className='mb-2 flex items-center gap-3'>
            <h1 className='text-4xl font-bold'>{course.title}</h1>
            <Badge variant='secondary' className='text-sm'>
              {course.level}
            </Badge>
          </div>
          <p className='text-muted-foreground mb-2 text-lg'>
            {course.description}
          </p>
          <p className='text-muted-foreground text-sm'>
            Language: {course.language}
          </p>
        </div>
      </div>
    </div>
  );
}
