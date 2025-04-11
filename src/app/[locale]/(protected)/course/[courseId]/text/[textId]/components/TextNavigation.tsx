"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  getNextTextId,
  getPreviousTextId,
} from "@/app/actions/text-navigation";

interface TextNavigationProps {
  courseId: string;
  textId: string;
}

export const TextNavigation = ({ courseId, textId }: TextNavigationProps) => {
  const router = useRouter();
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState({
    next: false,
    previous: false,
  });

  const handleNext = async () => {
    try {
      setIsLoading({ ...isLoading, next: true });
      const nextTextId = await getNextTextId(courseId, textId);

      if (nextTextId) {
        router.push(`/course/${courseId}/text/${nextTextId}`);
      }
    } catch (error) {
      console.error("Error navigating to next text:", error);
    } finally {
      setIsLoading({ ...isLoading, next: false });
    }
  };

  const handlePrevious = async () => {
    try {
      setIsLoading({ ...isLoading, previous: true });
      const previousTextId = await getPreviousTextId(courseId, textId);

      if (previousTextId) {
        router.push(`/course/${courseId}/text/${previousTextId}`);
      }
    } catch (error) {
      console.error("Error navigating to previous text:", error);
    } finally {
      setIsLoading({ ...isLoading, previous: false });
    }
  };

  return (
    <div className='flex justify-between'>
      <Button
        variant='outline'
        onClick={handlePrevious}
        disabled={isLoading.previous}
        className='flex items-center gap-1'
      >
        <ChevronLeftIcon className='h-4 w-4' />
        {isLoading.previous ? t("loading") : t("previous")}
      </Button>
      <Button
        onClick={handleNext}
        disabled={isLoading.next}
        className='flex items-center gap-1'
      >
        {isLoading.next ? t("loading") : t("next")}
        <ChevronRightIcon className='h-4 w-4' />
      </Button>
    </div>
  );
};
