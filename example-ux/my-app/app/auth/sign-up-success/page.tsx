import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col gap-6'>
          <div className='mb-4 flex items-center justify-center gap-2'>
            <BookOpen className='text-primary h-8 w-8' />
            <span className='text-2xl font-bold'>Read2Learn</span>
          </div>
          <Card>
            <CardHeader>
              <div className='mb-4 flex justify-center'>
                <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full'>
                  <Mail className='text-primary h-8 w-8' />
                </div>
              </div>
              <CardTitle className='text-center text-2xl'>
                Check Your Email
              </CardTitle>
              <CardDescription className='text-center'>
                We&apos;ve sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-muted-foreground text-center text-sm'>
                Please check your email and click the confirmation link to
                activate your account. Once confirmed, you can sign in and start
                learning!
              </p>
              <Button className='w-full' asChild>
                <Link href='/auth/login'>Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
