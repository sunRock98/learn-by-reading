"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const weeklyData = [
  { day: "Mon", words: 12, minutes: 25 },
  { day: "Tue", words: 18, minutes: 35 },
  { day: "Wed", words: 8, minutes: 15 },
  { day: "Thu", words: 22, minutes: 45 },
  { day: "Fri", words: 15, minutes: 30 },
  { day: "Sat", words: 28, minutes: 55 },
  { day: "Sun", words: 20, minutes: 40 },
];

const monthlyData = [
  { week: "Week 1", words: 45, texts: 3 },
  { week: "Week 2", words: 62, texts: 5 },
  { week: "Week 3", words: 38, texts: 2 },
  { week: "Week 4", words: 71, texts: 6 },
];

const languageData = [
  { language: "Spanish", words: 120, progress: 65 },
  { language: "French", words: 68, progress: 45 },
  { language: "German", words: 35, progress: 25 },
  { language: "Italian", words: 24, progress: 15 },
];

export function ProgressCharts() {
  return (
    <Card className='p-6'>
      <h2 className='mb-6 text-2xl font-bold'>Your Progress</h2>

      <Tabs defaultValue='weekly' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='weekly'>This Week</TabsTrigger>
          <TabsTrigger value='monthly'>This Month</TabsTrigger>
          <TabsTrigger value='languages'>By Language</TabsTrigger>
        </TabsList>

        <TabsContent value='weekly' className='space-y-6'>
          <div>
            <h3 className='mb-4 text-lg font-semibold'>
              Words Learned This Week
            </h3>
            <ChartContainer
              config={{
                words: {
                  label: "Words",
                  color: "hsl(var(--primary))",
                },
              }}
              className='h-[300px]'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={weeklyData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis dataKey='day' className='text-xs' />
                  <YAxis className='text-xs' />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey='words'
                    fill='hsl(var(--primary))'
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div>
            <h3 className='mb-4 text-lg font-semibold'>
              Reading Time (minutes)
            </h3>
            <ChartContainer
              config={{
                minutes: {
                  label: "Minutes",
                  color: "hsl(var(--accent))",
                },
              }}
              className='h-[300px]'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={weeklyData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis dataKey='day' className='text-xs' />
                  <YAxis className='text-xs' />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type='monotone'
                    dataKey='minutes'
                    stroke='hsl(var(--accent))'
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--accent))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value='monthly' className='space-y-6'>
          <div>
            <h3 className='mb-4 text-lg font-semibold'>Monthly Overview</h3>
            <ChartContainer
              config={{
                words: {
                  label: "Words",
                  color: "hsl(var(--primary))",
                },
                texts: {
                  label: "Texts",
                  color: "hsl(var(--accent))",
                },
              }}
              className='h-[300px]'
            >
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis dataKey='week' className='text-xs' />
                  <YAxis className='text-xs' />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey='words'
                    fill='hsl(var(--primary))'
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey='texts'
                    fill='hsl(var(--accent))'
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value='languages' className='space-y-4'>
          <h3 className='mb-4 text-lg font-semibold'>Progress by Language</h3>
          {languageData.map((lang) => (
            <div key={lang.language} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>{lang.language}</span>
                <span className='text-muted-foreground text-sm'>
                  {lang.words} words
                </span>
              </div>
              <div className='bg-secondary h-3 overflow-hidden rounded-full'>
                <div
                  className='bg-primary h-full transition-all'
                  style={{ width: `${lang.progress}%` }}
                />
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
