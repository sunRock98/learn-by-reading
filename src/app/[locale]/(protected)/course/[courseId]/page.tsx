"use server";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

const getCourseDetailsById = async (id: number) => {
  return await db.course.findUnique({
    where: {
      id,
    },
    select: {
      language: true,
      level: true,
    },
  });
};

const getTextsByCourseId = async (id: number) => {
  return await db.text.findMany({
    where: {
      courseId: id,
    },
    select: {
      id: true,
      title: true,
    },
  });
};

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

const CoursePage = async ({ params }: CoursePageProps) => {
  const { courseId } = await params;
  const t = await getTranslations("CoursePage");

  const courseDetails = await getCourseDetailsById(Number(courseId));
  const texts = await getTextsByCourseId(Number(courseId));

  return (
    <Card className='mx-auto max-w-4xl border-indigo-100 bg-white/50 backdrop-blur dark:border-indigo-950 dark:bg-gray-900/50'>
      <CardHeader>
        <BackButton
          href='/languages'
          labelKey='backToLanguages'
          defaultLabel='Back to Languages'
        />
        <h1 className='text-center text-2xl font-semibold tracking-tight text-indigo-900 dark:text-indigo-100'>
          {t("courseDetails")}
        </h1>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Course Details Section */}
          {courseDetails ? (
            <div className='space-y-2'>
              <p className='text-lg'>
                <strong className='text-indigo-800 dark:text-indigo-200'>
                  {t("language")}:
                </strong>{" "}
                <span className='text-gray-900 dark:text-gray-100'>
                  {courseDetails.language.name}
                </span>
              </p>
              <p className='text-lg'>
                <strong className='text-indigo-800 dark:text-indigo-200'>
                  {t("level")}:
                </strong>{" "}
                <span className='text-gray-900 dark:text-gray-100'>
                  {courseDetails.level.name}
                </span>
              </p>
            </div>
          ) : (
            <p className='text-gray-500 dark:text-gray-400'>
              {t("courseDetailsNotAvailable")}
            </p>
          )}

          {/* Course Texts Section */}
          <div>
            <h2 className='text-xl font-medium text-indigo-800 dark:text-indigo-200'>
              {t("courseTexts")}
            </h2>
            {texts.length === 0 ? (
              <p className='text-gray-500 dark:text-gray-400'>
                {t("noTextsAvailable")}
              </p>
            ) : (
              <ul className='space-y-4'>
                {texts.map((text) => (
                  <li key={text.id} className='border-b pb-2'>
                    <Link
                      href={`/course/${courseId}/text/${text.id}`}
                      className='text-indigo-600 hover:underline dark:text-indigo-300'
                    >
                      {text.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursePage;
