import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      {/* Course Header Skeleton */}
      <div className='mb-8'>
        {/* Back button skeleton */}
        <Skeleton className='mb-4 h-9 w-40' />

        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            {/* Title and badge */}
            <div className='mb-3 flex items-center gap-3'>
              <Skeleton className='h-10 w-48' />
              <Skeleton className='h-6 w-16 rounded-full' />
            </div>

            {/* Description */}
            <Skeleton className='mb-4 h-6 w-80' />

            {/* Progress bar */}
            <div className='mb-4 max-w-md'>
              <div className='mb-2 flex items-center justify-between'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-32' />
              </div>
              <Skeleton className='h-2 w-full rounded-full' />
            </div>

            {/* Stats */}
            <div className='flex items-center gap-6'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        </div>
      </div>

      {/* Text List Header Skeleton */}
      <div className='mb-6 flex items-center justify-between'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-9 w-36' />
      </div>

      {/* Text Cards Skeleton */}
      <div className='space-y-4'>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-3'>
                  <Skeleton className='h-5 w-5 rounded-full' />
                  <Skeleton className='h-6 w-48' />
                  <Skeleton className='h-5 w-12 rounded-full' />
                </div>
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-16' />
                </div>
              </div>
              <Skeleton className='h-10 w-28' />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
