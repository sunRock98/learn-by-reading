import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TextNavigation } from "./components/TextNavigation";
import { BackButton } from "@/components/ui/back-button";
import { InteractiveText } from "@/components/interactive-text";

interface TextPageProps {
  params: Promise<{
    courseId: string;
    textId: string;
  }>;
}

const fetchTextWithCourse = async (courseId: string, textId: string) => {
  try {
    const text = await db.text.findUnique({
      where: {
        id: parseInt(textId),
        courseId: parseInt(courseId),
      },
      include: {
        course: {
          include: {
            language: true,
            level: true,
          },
        },
      },
    });
    return text;
  } catch (error) {
    console.error("Error fetching text:", error);
    return null;
  }
};

const TextPage = async ({ params }: TextPageProps) => {
  const { courseId, textId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const text = await fetchTextWithCourse(courseId, textId);

  if (!text) {
    notFound();
  }

  // Get user's native language (default to English)
  const userWithLanguage = await db.user.findUnique({
    where: { id: user.id },
    select: { nativeLanguage: true },
  });

  const userNativeLanguage = userWithLanguage?.nativeLanguage || "English";

  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      <div className='mb-6'>
        <BackButton
          href={`/course/${courseId}`}
          labelKey='backToCourse'
          defaultLabel='Back to Course'
        />
      </div>

      <InteractiveText
        text={{
          id: text.id,
          title: text.title,
          content: text.content,
          courseId: text.courseId,
        }}
        course={{
          language: {
            name: text.course.language.name,
          },
          level: {
            name: text.course.level.name,
          },
        }}
        userNativeLanguage={userNativeLanguage}
      />

      <div className='mt-8'>
        <TextNavigation courseId={courseId} textId={textId} />
      </div>
    </div>
  );
};

export default TextPage;
