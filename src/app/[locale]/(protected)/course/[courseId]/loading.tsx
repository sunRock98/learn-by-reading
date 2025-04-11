import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <Card className='mx-auto max-w-4xl border-indigo-100 bg-white/50 backdrop-blur dark:border-indigo-950 dark:bg-gray-900/50'>
      <CardHeader>
        <div className='mb-4 h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700'></div>
        <h1 className='text-center text-2xl font-semibold tracking-tight text-indigo-900 dark:text-indigo-100'>
          Loading Course Details...
        </h1>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Course Details Skeleton */}
          <div className='space-y-2'>
            <div className='h-5 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-700'></div>
            <div className='h-5 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700'></div>
          </div>

          {/* Course Texts Skeleton */}
          <div>
            <h2 className='text-xl font-medium text-indigo-800 dark:text-indigo-200'>
              Loading Course Texts...
            </h2>
            <ul className='space-y-4'>
              {[...Array(3)].map((_, index) => (
                <li
                  key={index}
                  className='h-5 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700'
                ></li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
