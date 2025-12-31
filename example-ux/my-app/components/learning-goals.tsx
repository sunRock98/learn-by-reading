import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, Plus } from "lucide-react"

const goals = [
  {
    id: "1",
    title: "Learn 50 new words",
    current: 32,
    target: 50,
    period: "This Week",
  },
  {
    id: "2",
    title: "Complete 5 texts",
    current: 3,
    target: 5,
    period: "This Week",
  },
  {
    id: "3",
    title: "Read for 2 hours",
    current: 85,
    target: 120,
    period: "This Week",
  },
]

export function LearningGoals() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Learning Goals</h2>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{goal.title}</p>
                  <p className="text-sm text-muted-foreground mb-2">{goal.period}</p>
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {goal.current} / {goal.target}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
