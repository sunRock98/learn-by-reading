import { Header } from "@/components/header"
import { TextList } from "@/components/text-list"
import { CourseHeader } from "@/components/course-header"
import { notFound } from "next/navigation"

const mockCourses = {
  "1": {
    id: "1",
    title: "Spanish Short Stories",
    description: "Engaging tales for intermediate learners",
    level: "B1",
    language: "Spanish",
    texts: [
      {
        id: "1",
        title: "El Gato y el Ratón",
        difficulty: "B1",
        wordCount: 250,
        estimatedTime: "2 min",
        completed: true,
      },
      {
        id: "2",
        title: "Una Aventura en Madrid",
        difficulty: "B1",
        wordCount: 320,
        estimatedTime: "3 min",
        completed: true,
      },
      {
        id: "3",
        title: "La Fiesta de Cumpleaños",
        difficulty: "B1",
        wordCount: 280,
        estimatedTime: "2 min",
        completed: false,
      },
      {
        id: "4",
        title: "El Mercado Local",
        difficulty: "B1",
        wordCount: 300,
        estimatedTime: "3 min",
        completed: false,
      },
    ],
  },
  "2": {
    id: "2",
    title: "French News Articles",
    description: "Current events in simplified French",
    level: "B2",
    language: "French",
    texts: [
      {
        id: "1",
        title: "Les Nouvelles Technologies",
        difficulty: "B2",
        wordCount: 450,
        estimatedTime: "4 min",
        completed: true,
      },
      {
        id: "2",
        title: "Le Climat en France",
        difficulty: "B2",
        wordCount: 420,
        estimatedTime: "4 min",
        completed: false,
      },
    ],
  },
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const course = mockCourses[id as keyof typeof mockCourses]

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <CourseHeader course={course} />
        <TextList texts={course.texts} courseId={course.id} />
      </main>
    </div>
  )
}
