import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TextNavigation } from "./components/TextNavigation";
import { BackButton } from "@/components/ui/back-button";
import { InteractiveText } from "@/components/interactive-text";
import { ExerciseSection } from "@/components/exercises/exercise-section";
import { getDictionaryWordsForHighlighting } from "@/actions/dictionary";
import { getExercisesForText } from "@/actions/exercises";

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
      select: {
        id: true,
        title: true,
        content: true,
        courseId: true,
        picture_url: true,
        // Deliberately omit picture_data — it's large binary data served via /api/images/[textId]
        course: {
          select: {
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

  // Get dictionary words for highlighting
  const { words: dictionaryWords } = await getDictionaryWordsForHighlighting(
    parseInt(courseId)
  );

  // Check if user already completed this text
  const userProgress = await db.userProgress.findUnique({
    where: {
      userId_textId: {
        userId: user.id!,
        textId: text.id,
      },
    },
    select: { seen: true },
  });

  // Get exercises for this text
  const exercisesResult = await getExercisesForText(text.id);
  const exercises = exercisesResult.exercises || [];

  return (
    <div className='container mx-auto max-w-6xl px-4 py-4 sm:py-6 lg:py-8'>
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
          pictureUrl: text.picture_url,
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
        dictionaryWords={dictionaryWords}
        isCompleted={userProgress?.seen ?? false}
      />

      {/* Exercises Section */}
      <div className='mx-auto mt-8 max-w-4xl'>
        <ExerciseSection
          textId={text.id}
          courseId={text.courseId}
          exercises={exercises}
        />
      </div>

      <div className='mx-auto mt-8 max-w-4xl'>
        <TextNavigation courseId={courseId} textId={textId} />
      </div>
    </div>
  );
};

export default TextPage;
