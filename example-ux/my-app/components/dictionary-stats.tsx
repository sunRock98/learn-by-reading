import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, Target, Star } from "lucide-react";

export function DictionaryStats() {
  const stats = [
    {
      label: "Total Words",
      value: "247",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      label: "Mastered",
      value: "89",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-950",
    },
    {
      label: "Learning",
      value: "158",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      label: "This Week",
      value: "+23",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
  ];

  return (
    <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-4'>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className='p-6'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-muted-foreground mb-1 text-sm'>
                  {stat.label}
                </p>
                <p className='text-3xl font-bold'>{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
