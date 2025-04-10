"use server";

import { db } from "@/lib/db";

const getTextsByCourseId = async (id: number) => {
  return await db.text.findMany({
    where: {
      courseId: id,
    },
    select: {
      id: true,
      content: true,
    },
  });
};

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

const CoursePage = async ({ params }: CoursePageProps) => {
  const { id } = await params;
  const courseId = Number(id);
  const texts = await getTextsByCourseId(courseId);

  return (
    <div className='p-4'>
      <div className='space-y-4'>
        {texts.map((text) => (
          <div key={text.id} className='rounded-lg bg-white p-4 shadow'>
            <p>{text.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursePage;
