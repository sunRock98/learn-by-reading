import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Target } from "lucide-react"
import Link from "next/link"

const mockCourses = [
  {
    id: "1",
    title: "Spanish Short Stories",
    description: "Engaging tales for intermediate learners",
    level: "B1",
    textsCount: 12,
    completedTexts: 5,
    estimatedTime: "2-3 min per text",
    language: "Spanish",
  },
  {
    id: "2",
    title: "French News Articles",
    description: "Current events in simplified French",
    level: "B2",
    textsCount: 20,
    completedTexts: 3,
    estimatedTime: "3-5 min per text",
    language: "French",
  },
  {
    id: "3",
    title: "German Fairy Tales",
    description: "Classic stories for beginners",
    level: "A2",
    textsCount: 15,
    completedTexts: 0,
    estimatedTime: "2-3 min per text",
    language: "German",
  },
  {
    id: "4",
    title: "Italian Travel Guides",
    description: "Explore Italy through reading",
    level: "B1",
    textsCount: 10,
    completedTexts: 8,
    estimatedTime: "3-4 min per text",
    language: "Italian",
  },
]

export function CourseGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Courses</h2>
        <Button variant="outline" size="sm">
          Browse All Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockCourses.map((course) => {
          const progress = (course.completedTexts / course.textsCount) * 100

          return (
            <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{course.title}</h3>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{course.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {course.completedTexts} / {course.textsCount} texts completed
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{course.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href={`/course/${course.id}`}>
                  {course.completedTexts > 0 ? "Continue Reading" : "Start Course"}
                </Link>
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
