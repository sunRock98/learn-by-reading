import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";

export function ProfileHeader() {
  return (
    <Card className='mb-8 p-6'>
      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-4'>
          <div className='bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full'>
            <User className='text-primary h-10 w-10' />
          </div>
          <div>
            <h1 className='mb-2 text-3xl font-bold'>Language Learner</h1>
            <div className='mb-3 flex items-center gap-2'>
              <Badge variant='secondary' className='text-sm'>
                Level B1
              </Badge>
              <Badge variant='outline' className='text-sm'>
                7 day streak
              </Badge>
            </div>
            <p className='text-muted-foreground'>
              Learning Spanish, French, German, and Italian
            </p>
          </div>
        </div>
        <Button variant='outline' size='sm'>
          <Settings className='mr-2 h-4 w-4' />
          Settings
        </Button>
      </div>

      <div className='mt-6 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4'>
        <div>
          <p className='text-2xl font-bold'>247</p>
          <p className='text-muted-foreground text-sm'>Words Learned</p>
        </div>
        <div>
          <p className='text-2xl font-bold'>32</p>
          <p className='text-muted-foreground text-sm'>Texts Completed</p>
        </div>
        <div>
          <p className='text-2xl font-bold'>18h</p>
          <p className='text-muted-foreground text-sm'>Time Reading</p>
        </div>
        <div>
          <p className='text-2xl font-bold'>4</p>
          <p className='text-muted-foreground text-sm'>Languages</p>
        </div>
      </div>
    </Card>
  );
}
