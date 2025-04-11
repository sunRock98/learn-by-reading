"use client";

import { useTransition } from "react";
import { Course } from "../types";
import { deleteCourse } from "@/actions/delete-course-from-user";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { activateCourse } from "@/actions/activate-course";
import { redirect } from "next/navigation";

type Props = {
  course: Course;
};

export const UserCourseItem = ({ course }: Props) => {
  const { id, language, level } = course;
  const t = useTranslations("LanguageLevels");
  const [isPending, startTransition] = useTransition();

  const handleStartCourse = async () => {
    startTransition(() => {
      activateCourse(id).then((resp) => {
        if (resp.activeCourse) {
          redirect(`course/${id}`);
        }
      });
    });
  };

  const handleDeleteCourse = async () => {
    startTransition(() => {
      deleteCourse(id);
    });
  };

  return (
    <div
      key={id}
      className='flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 p-3 transition-colors hover:border-indigo-300'
    >
      <div>
        <span className='font-medium text-indigo-800'>{language.name}</span>
        <span className='mx-2 text-indigo-400'>•</span>
        <span className='text-indigo-600'>
          {t(level.name) + " - " + level.name}
        </span>
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          variant='ghost'
          size='sm'
          disabled={isPending}
          onClick={handleStartCourse}
          className='text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700'
        >
          {isPending ? (
            <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            "Start"
          )}
        </Button>
        <Button
          variant='ghost'
          size='sm'
          disabled={isPending}
          onClick={handleDeleteCourse}
          className='text-red-500 hover:bg-red-100 hover:text-red-700'
        >
          X
        </Button>
      </div>
    </div>
  );
};
