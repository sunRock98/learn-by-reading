"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { GenerateTextModal } from "./generate-text-modal";
import { useTranslations } from "next-intl";

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

function estimateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 150);
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
  const t = useTranslations("TextList");
  const tCommon = useTranslations("common");

  if (texts.length === 0) {
    return (
      <div>
        <h2 className='mb-6 text-2xl font-bold'>{t("readingTexts")}</h2>
        <div className='card-hover border-border bg-card/50 relative overflow-hidden rounded-2xl border border-dashed p-12'>
          <div className='bg-linear-to-br from-primary/3 absolute inset-0 to-transparent' />
          <div className='relative flex flex-col items-center justify-center text-center'>
            <div className='gradient-bg animate-bounce-subtle mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg'>
              <BookOpen className='h-7 w-7 text-white' />
            </div>
            <h3 className='mb-2 text-xl font-bold'>{t("noTexts")}</h3>
            <p className='text-muted-foreground mb-6'>
              {t("noTextsDescription")}
            </p>
            <Button
              size='lg'
              className='gradient-bg gap-2 border-0 text-white shadow-lg hover:shadow-xl hover:brightness-110'
              onClick={() => setIsModalOpen(true)}
            >
              <Sparkles className='h-5 w-5' />
              {t("generateFirst")}
            </Button>
          </div>
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

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>{t("readingTexts")}</h2>
        <Button
          variant='outline'
          size='sm'
          className='group gap-2'
          onClick={() => setIsModalOpen(true)}
        >
          <Sparkles className='h-4 w-4 transition-transform group-hover:rotate-12' />
          {t("generateNew")}
        </Button>
      </div>

      <div className='space-y-4'>
        {texts.map((text, index) => {
          const wordCount = getWordCount(text.content);
          const estimatedTime = estimateReadingTime(text.content);

          return (
            <div
              key={text.id}
              className='card-hover card-shine border-border/50 bg-card group relative overflow-hidden rounded-2xl border p-6'
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Status indicator bar */}
              {text.completed && (
                <div className='bg-linear-to-b absolute left-0 top-0 h-full w-1 from-[oklch(0.55_0.14_175)] to-[oklch(0.58_0.13_165)]' />
              )}

              <div
                className={`flex items-center justify-between ${text.completed ? "pl-4" : ""}`}
              >
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-3'>
                    {text.completed ? (
                      <CheckCircle2 className='h-5 w-5 shrink-0 text-[oklch(0.55_0.14_175)]' />
                    ) : (
                      <span className='gradient-bg flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm'>
                        {index + 1}
                      </span>
                    )}
                    <h3 className='text-lg font-bold'>{text.title}</h3>
                    <Badge variant='outline' className='rounded-full text-xs'>
                      {levelName}
                    </Badge>
                  </div>

                  <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                    <div className='flex items-center gap-1.5'>
                      <BookOpen className='h-3.5 w-3.5' />
                      <span>
                        {wordCount} {tCommon("words")}
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <Clock className='h-3.5 w-3.5' />
                      <span>
                        {estimatedTime} {tCommon("min")}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className={`group/btn ${text.completed ? "" : "gradient-bg border-0 text-white shadow-md hover:shadow-lg hover:brightness-110"}`}
                  variant={text.completed ? "outline" : "default"}
                >
                  <Link href={`/course/${courseId}/text/${text.id}`}>
                    {text.completed ? t("readAgain") : t("startReading")}
                    <ArrowRight className='ml-1.5 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5' />
                  </Link>
                </Button>
              </div>
            </div>
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
