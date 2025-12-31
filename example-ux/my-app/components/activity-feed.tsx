import { Card } from "@/components/ui/card"
import { BookOpen, BookmarkPlus, CheckCircle2, Trophy } from "lucide-react"

const activities = [
  {
    id: "1",
    type: "completed",
    title: "Completed 'El Gato y el Ratón'",
    description: "Spanish • B1 Level",
    time: "2 hours ago",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950",
  },
  {
    id: "2",
    type: "word",
    title: "Added 5 new words to dictionary",
    description: "gato, ratón, casa, inteligente, queso",
    time: "2 hours ago",
    icon: BookmarkPlus,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950",
  },
  {
    id: "3",
    type: "achievement",
    title: "Earned '7 Day Streak' badge",
    description: "Keep up the great work!",
    time: "1 day ago",
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-950",
  },
  {
    id: "4",
    type: "completed",
    title: "Completed 'Les Nouvelles Technologies'",
    description: "French • B2 Level",
    time: "2 days ago",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950",
  },
  {
    id: "5",
    type: "started",
    title: "Started 'French News Articles' course",
    description: "20 texts • B2 Level",
    time: "3 days ago",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-950",
  },
]

export function ActivityFeed() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
              <div className={`p-3 ${activity.bgColor} rounded-xl`}>
                <Icon className={`h-5 w-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">{activity.title}</p>
                <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
