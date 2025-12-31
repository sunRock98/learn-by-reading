"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { generateNewText } from "@/actions/generateNewText";
import { Loader2, Sparkles, Shuffle } from "lucide-react";
import { useTranslations } from "next-intl";

interface GenerateTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  languageName: string;
  levelName: string;
}

export function GenerateTextModal({
  isOpen,
  onClose,
  courseId,
  languageName,
  levelName,
}: GenerateTextModalProps) {
  const t = useTranslations("GenerateTextModal");
  const tCommon = useTranslations("common");

  const TOPIC_SUGGESTIONS = [
    t("topics.beach"),
    t("topics.restaurant"),
    t("topics.friends"),
    t("topics.market"),
    t("topics.weekend"),
    t("topics.cooking"),
    t("topics.letter"),
    t("topics.pet"),
  ];

  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * TOPIC_SUGGESTIONS.length);
    setTopic(TOPIC_SUGGESTIONS[randomIndex]);
  };

  const handleGenerate = () => {
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await generateNewText({
          courseId,
          languageName,
          levelName,
          topic: topic.trim() || undefined,
        });

        if (result?.success) {
          onClose();
          setTopic("");
          router.refresh();
          // Navigate to the new text if ID is returned
          if (result.textId) {
            router.push(`/course/${courseId}/text/${result.textId}`);
          }
        } else {
          setError(result?.error || t("failedToGenerate"));
        }
      } catch (err) {
        setError(t("unexpectedError"));
        console.error(err);
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setTopic("");
      setError(undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("description", { language: languageName, level: levelName })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='topic'>{t("topicLabel")}</Label>
            <div className='flex gap-2'>
              <Input
                id='topic'
                placeholder={t("topicPlaceholder")}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isPending}
                className='flex-1'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={handleRandomTopic}
                disabled={isPending}
                title='Random topic'
              >
                <Shuffle className='h-4 w-4' />
              </Button>
            </div>
            <p className='text-muted-foreground text-xs'>{t("topicHint")}</p>
          </div>

          {/* Topic suggestions */}
          <div className='space-y-2'>
            <Label className='text-muted-foreground text-xs'>
              {t("quickSuggestions")}
            </Label>
            <div className='flex flex-wrap gap-2'>
              {TOPIC_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                <Button
                  key={suggestion}
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => setTopic(suggestion)}
                  disabled={isPending}
                  className='text-xs'
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          <FormError message={error} />
        </div>

        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t("generating")}
              </>
            ) : (
              <>
                <Sparkles className='mr-2 h-4 w-4' />
                {t("generate")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
