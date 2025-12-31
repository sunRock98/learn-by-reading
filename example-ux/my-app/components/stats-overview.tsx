import { Card } from "@/components/ui/card";
import { BookOpen, Target, TrendingUp } from "lucide-react";

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
  ];

  return (
    <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3'>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className='p-6'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-muted-foreground mb-1 text-sm'>
                  {stat.label}
                </p>
                <p className='mb-1 text-3xl font-bold'>{stat.value}</p>
                <p className='text-muted-foreground text-xs'>{stat.change}</p>
              </div>
              <div className='bg-primary/10 rounded-xl p-3'>
                <Icon className='text-primary h-5 w-5' />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
