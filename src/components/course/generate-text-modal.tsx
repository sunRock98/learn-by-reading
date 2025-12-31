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

interface GenerateTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  languageName: string;
  levelName: string;
}

const TOPIC_SUGGESTIONS = [
  "A day at the beach",
  "Ordering food at a restaurant",
  "Meeting new friends",
  "A trip to the market",
  "Weekend adventures",
  "Learning to cook",
  "A mysterious letter",
  "The lost pet",
];

export function GenerateTextModal({
  isOpen,
  onClose,
  courseId,
  languageName,
  levelName,
}: GenerateTextModalProps) {
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
          setError(result?.error || "Failed to generate text");
        }
      } catch (err) {
        setError("An unexpected error occurred");
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
            Generate New Text
          </DialogTitle>
          <DialogDescription>
            Create a new reading text in {languageName} at {levelName} level.
            Optionally provide a topic or let AI choose one for you.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='topic'>Topic (Optional)</Label>
            <div className='flex gap-2'>
              <Input
                id='topic'
                placeholder='e.g., A day at the beach, Travel, Food...'
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
            <p className='text-muted-foreground text-xs'>
              Leave empty to generate a random interesting story
            </p>
          </div>

          {/* Topic suggestions */}
          <div className='space-y-2'>
            <Label className='text-muted-foreground text-xs'>
              Quick suggestions:
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
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className='mr-2 h-4 w-4' />
                Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
