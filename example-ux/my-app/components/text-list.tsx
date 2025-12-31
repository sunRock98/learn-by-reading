import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Text {
  id: string
  title: string
  difficulty: string
  wordCount: number
  estimatedTime: string
  completed: boolean
}

interface TextListProps {
  texts: Text[]
  courseId: string
}

export function TextList({ texts, courseId }: TextListProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reading Texts</h2>

      <div className="space-y-4">
        {texts.map((text) => (
          <Card key={text.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {text.completed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  <h3 className="text-xl font-bold">{text.title}</h3>
                  <Badge variant="outline">{text.difficulty}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{text.wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{text.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <Button asChild>
                <Link href={`/read/${courseId}/${text.id}`}>{text.completed ? "Read Again" : "Start Reading"}</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
