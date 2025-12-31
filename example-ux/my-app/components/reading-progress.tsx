import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ReadingProgressProps {
  courseId: string;
  textId: string;
}

export function ReadingProgress({ courseId, textId }: ReadingProgressProps) {
  return (
    <div className='mb-6'>
      <Button variant='ghost' size='sm' asChild>
        <Link href={`/course/${courseId}`}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Course
        </Link>
      </Button>
    </div>
  );
}
