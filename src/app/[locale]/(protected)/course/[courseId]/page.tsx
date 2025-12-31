import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CourseHeader } from "@/components/course/course-header";
import { TextList } from "@/components/course/text-list";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

async function getCourseData(courseId: number, userId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      language: true,
      level: true,
      texts: {
        include: {
          progress: {
            where: { userId },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  // Transform texts to include completion status
  const textsWithCompletion = course.texts.map((text) => ({
    id: text.id,
    title: text.title,
    content: text.content,
    completed: text.progress.some((p) => p.seen),
  }));

  const completedTexts = textsWithCompletion.filter((t) => t.completed).length;

  return {
    language: course.language.name,
    level: course.level.name,
    textsCount: course.texts.length,
    completedTexts,
    texts: textsWithCompletion,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const courseData = await getCourseData(Number(courseId), user.id!);

  if (!courseData) {
    notFound();
  }

  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      <CourseHeader
        course={{
          language: courseData.language,
          level: courseData.level,
          textsCount: courseData.textsCount,
          completedTexts: courseData.completedTexts,
        }}
      />
      <TextList
        texts={courseData.texts}
        courseId={Number(courseId)}
        levelName={courseData.level}
        languageName={courseData.language}
      />
    </div>
  );
}
