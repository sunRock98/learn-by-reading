import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TextNavigation } from "./components/TextNavigation";
import { BackButton } from "@/components/ui/back-button";

interface TextPageProps {
  params: Promise<{
    courseId: string;
    textId: string;
  }>;
}

const fetchText = async (courseId: string, textId: string) => {
  try {
    const text = await db.text.findUnique({
      where: {
        id: parseInt(textId),
        courseId: parseInt(courseId),
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
  const text = await fetchText(courseId, textId);

  if (!text) {
    notFound();
  }

  return (
    <Card className='mx-auto max-w-4xl border-indigo-100 bg-white/50 backdrop-blur dark:border-indigo-950 dark:bg-gray-900/50'>
      <CardHeader>
        <div className='mb-4'>
          <BackButton
            href={`/course/${courseId}`}
            labelKey='backToCourse'
            defaultLabel='Back to Course'
          />
        </div>
        <h1 className='text-center text-2xl font-semibold tracking-tight text-indigo-900 dark:text-indigo-100'>
          {text.title}
        </h1>
      </CardHeader>
      <CardContent>
        <div className='prose prose-indigo dark:prose-invert mx-auto max-w-3xl'>
          <p className='whitespace-pre-wrap'>{text.content}</p>
        </div>
        <div className='mt-8'>
          <TextNavigation courseId={courseId} textId={textId} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TextPage;
