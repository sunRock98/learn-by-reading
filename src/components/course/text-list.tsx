"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { GenerateTextModal } from "./generate-text-modal";

interface Text {
  id: number;
  title: string;
  content: string;
  completed: boolean;
}

interface TextListProps {
  texts: Text[];
  courseId: number;
  levelName: string;
  languageName: string;
}

function estimateReadingTime(content: string): string {
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 150); // Average reading speed
  return `${minutes} min`;
}

function getWordCount(content: string): number {
  return content.split(/\s+/).length;
}

export function TextList({
  texts,
  courseId,
  levelName,
  languageName,
}: TextListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (texts.length === 0) {
    return (
      <div>
        <h2 className='mb-6 text-2xl font-bold'>Reading Texts</h2>
        <Card className='p-12'>
          <div className='flex flex-col items-center justify-center text-center'>
            <BookOpen className='text-muted-foreground mb-4 h-12 w-12' />
            <h3 className='mb-2 text-xl font-semibold'>No Texts Yet</h3>
            <p className='text-muted-foreground mb-6'>
              Generate your first reading text to start learning!
            </p>
            <Button
              size='lg'
              className='gap-2'
              onClick={() => setIsModalOpen(true)}
            >
              <Sparkles className='h-5 w-5' />
              Generate First Text
            </Button>
          </div>
        </Card>
        <GenerateTextModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          courseId={courseId}
          languageName={languageName}
          levelName={levelName}
        />
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Reading Texts</h2>
        <Button
          variant='outline'
          size='sm'
          className='gap-2'
          onClick={() => setIsModalOpen(true)}
        >
          <Sparkles className='h-4 w-4' />
          Generate New Text
        </Button>
      </div>

      <div className='space-y-4'>
        {texts.map((text, index) => {
          const wordCount = getWordCount(text.content);
          const estimatedTime = estimateReadingTime(text.content);

          return (
            <Card
              key={text.id}
              className='p-6 transition-shadow hover:shadow-lg'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-3'>
                    {text.completed ? (
                      <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-green-600' />
                    ) : (
                      <span className='bg-muted flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium'>
                        {index + 1}
                      </span>
                    )}
                    <h3 className='text-xl font-bold'>{text.title}</h3>
                    <Badge variant='outline'>{levelName}</Badge>
                  </div>

                  <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                    <div className='flex items-center gap-1'>
                      <BookOpen className='h-4 w-4' />
                      <span>{wordCount} words</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span>{estimatedTime}</span>
                    </div>
                  </div>
                </div>

                <Button asChild>
                  <Link href={`/course/${courseId}/text/${text.id}`}>
                    {text.completed ? "Read Again" : "Start Reading"}
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <GenerateTextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={courseId}
        languageName={languageName}
        levelName={levelName}
      />
    </div>
  );
}
