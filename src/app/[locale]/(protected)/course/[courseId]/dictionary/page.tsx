import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserDictionaryWords } from "@/actions/dictionary";
import { DictionaryGrid } from "@/components/dictionary-grid";
import { DictionaryStats } from "@/components/dictionary-stats";
import { BackButton } from "@/components/ui/back-button";

interface CourseDictionaryPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseDictionaryPage({
  params,
}: CourseDictionaryPageProps) {
  const { courseId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const course = await db.course.findUnique({
    where: { id: parseInt(courseId) },
    include: {
      language: true,
      level: true,
    },
  });

  if (!course) {
    notFound();
  }

  const { words } = await getUserDictionaryWords(parseInt(courseId));

  return (
    <div className='container mx-auto max-w-6xl px-4 py-4 sm:py-6 lg:py-8'>
      <div className='mb-6'>
        <BackButton
          href={`/course/${courseId}`}
          labelKey='backToCourse'
          defaultLabel='Back to Course'
        />
      </div>

      <div className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold'>
          {course.language.name} Dictionary
        </h1>
        <p className='text-muted-foreground text-lg'>
          {course.level.name} level - {words.length} words
        </p>
      </div>

      <DictionaryStats words={words} />
      <DictionaryGrid words={words} />
    </div>
  );
}
