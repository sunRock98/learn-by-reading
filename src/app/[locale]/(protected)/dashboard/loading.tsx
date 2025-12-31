import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className='container mx-auto max-w-6xl px-4 py-8'>
      {/* Header skeleton */}
      <div className='mb-8'>
        <Skeleton className='mb-2 h-10 w-72' />
        <Skeleton className='h-6 w-96' />
      </div>

      {/* Stats Overview skeleton */}
      <div className='mb-8 grid gap-4 md:grid-cols-3'>
        {[...Array(3)].map((_, index) => (
          <Card key={index} className='p-6'>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-12 w-12 rounded-lg' />
              <div className='flex-1'>
                <Skeleton className='mb-2 h-4 w-24' />
                <Skeleton className='h-8 w-16' />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className='grid gap-8 lg:grid-cols-3'>
        {/* Courses section */}
        <div className='lg:col-span-2'>
          <div className='mb-6 flex items-center justify-between'>
            <Skeleton className='h-8 w-36' />
            <Skeleton className='h-9 w-28' />
          </div>
          <div className='grid gap-6 md:grid-cols-2'>
            {[...Array(2)].map((_, index) => (
              <Card key={index} className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <Skeleton className='h-8 w-32' />
                  <Skeleton className='h-6 w-12 rounded-full' />
                </div>
                <Skeleton className='mb-4 h-4 w-48' />
                <div className='mb-4 flex items-center gap-4'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <Skeleton className='h-10 w-full' />
              </Card>
            ))}
          </div>
        </div>

        {/* Recent words section */}
        <div>
          <Skeleton className='mb-6 h-8 w-32' />
          <Card className='p-6'>
            <div className='space-y-4'>
              {[...Array(5)].map((_, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div>
                    <Skeleton className='mb-1 h-5 w-24' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                  <Skeleton className='h-8 w-8 rounded-full' />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
