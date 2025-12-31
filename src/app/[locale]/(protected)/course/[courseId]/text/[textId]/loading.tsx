import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      {/* Back button skeleton */}
      <Skeleton className='mb-6 h-9 w-32' />

      {/* Main content card */}
      <Card className='mb-6 p-8'>
        {/* Header with title and mode toggle */}
        <div className='mb-6'>
          <div className='mb-4 flex items-center justify-between'>
            <Skeleton className='h-9 w-64' />
            <Skeleton className='h-6 w-16 rounded-full' />
          </div>

          {/* Mode toggle buttons */}
          <div className='flex gap-2'>
            <Skeleton className='h-9 w-20' />
            <Skeleton className='h-9 w-20' />
          </div>
        </div>

        {/* Instructions */}
        <Skeleton className='mb-4 h-4 w-80' />

        {/* Text content skeleton */}
        <div className='space-y-3'>
          <Skeleton className='h-5 w-full' />
          <Skeleton className='h-5 w-full' />
          <Skeleton className='h-5 w-11/12' />
          <Skeleton className='h-5 w-full' />
          <Skeleton className='h-5 w-4/5' />
          <Skeleton className='h-5 w-full' />
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-5 w-full' />
          <Skeleton className='h-5 w-5/6' />
        </div>
      </Card>

      {/* Complete button skeleton */}
      <div className='flex justify-center'>
        <Skeleton className='h-12 w-44' />
      </div>
    </div>
  );
}
