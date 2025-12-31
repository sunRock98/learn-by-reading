import { Card } from "@/components/ui/card"
import { BookOpen, Target, TrendingUp } from "lucide-react"

export function StatsOverview() {
  const stats = [
    {
      label: "Words Learned",
      value: "247",
      icon: BookOpen,
      change: "+12 this week",
    },
    {
      label: "Current Streak",
      value: "7 days",
      icon: Target,
      change: "Keep it up!",
    },
    {
      label: "Reading Level",
      value: "B1",
      icon: TrendingUp,
      change: "Intermediate",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
