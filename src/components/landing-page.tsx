import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe, Brain, TrendingUp, Sparkles } from "lucide-react";

export function LandingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-6 w-6 text-primary' />
              <span className='text-xl font-bold'>Read2Learn</span>
            </div>
            <div className='flex items-center gap-3'>
              <Button variant='ghost' asChild>
                <Link href='/auth/login'>Login</Link>
              </Button>
              <Button asChild>
                <Link href='/auth/sign-up'>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-20 md:py-32'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='mb-6 text-balance text-5xl font-bold md:text-6xl'>
            Master Languages Through{" "}
            <span className='text-primary'>Authentic Reading</span>
          </h1>
          <p className='mb-8 text-pretty text-xl text-muted-foreground'>
            Learn naturally by reading texts tailored to your level and
            interests. Click any word for instant translations and build your
            vocabulary effortlessly.
          </p>
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <Button size='lg' asChild>
              <Link href='/auth/sign-up'>Start Learning Free</Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/auth/login'>Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-4 py-20'>
        <div className='mx-auto grid max-w-5xl gap-8 md:grid-cols-3'>
          <div className='flex flex-col items-center rounded-xl border bg-card p-6 text-center'>
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <Globe className='h-6 w-6 text-primary' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>Multiple Languages</h3>
            <p className='text-sm text-muted-foreground'>
              Learn Spanish, French, German, Italian, and more with content
              adapted to your level
            </p>
          </div>

          <div className='flex flex-col items-center rounded-xl border bg-card p-6 text-center'>
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <Brain className='h-6 w-6 text-primary' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>AI-Powered Learning</h3>
            <p className='text-sm text-muted-foreground'>
              Generate custom texts based on your interests and get instant
              translations for any word
            </p>
          </div>

          <div className='flex flex-col items-center rounded-xl border bg-card p-6 text-center'>
            <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <TrendingUp className='h-6 w-6 text-primary' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>Track Progress</h3>
            <p className='text-sm text-muted-foreground'>
              Monitor your vocabulary growth and reading progress with detailed
              analytics
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='container mx-auto bg-muted/30 px-4 py-20'>
        <div className='mx-auto max-w-4xl'>
          <h2 className='mb-12 text-center text-3xl font-bold'>How It Works</h2>
          <div className='space-y-8'>
            <div className='flex gap-4'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground'>
                1
              </div>
              <div>
                <h3 className='mb-1 text-lg font-semibold'>
                  Choose Your Language & Level
                </h3>
                <p className='text-muted-foreground'>
                  Select the language you want to learn and your current
                  proficiency level (A1-C2)
                </p>
              </div>
            </div>

            <div className='flex gap-4'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground'>
                2
              </div>
              <div>
                <h3 className='mb-1 text-lg font-semibold'>
                  Read Engaging Content
                </h3>
                <p className='text-muted-foreground'>
                  Browse curated texts or generate custom content based on your
                  interests
                </p>
              </div>
            </div>

            <div className='flex gap-4'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground'>
                3
              </div>
              <div>
                <h3 className='mb-1 text-lg font-semibold'>Learn Naturally</h3>
                <p className='text-muted-foreground'>
                  Click any word for instant translation and save it to your
                  personal dictionary
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='container mx-auto px-4 py-20'>
        <div className='mx-auto max-w-3xl rounded-2xl border bg-primary/5 p-12 text-center'>
          <Sparkles className='mx-auto mb-4 h-12 w-12 text-primary' />
          <h2 className='mb-4 text-3xl font-bold'>Ready to Start Learning?</h2>
          <p className='mb-8 text-muted-foreground'>
            Join thousands of learners mastering new languages through reading
          </p>
          <Button size='lg' asChild>
            <Link href='/auth/sign-up'>Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t py-8'>
        <div className='container mx-auto px-4 text-center text-sm text-muted-foreground'>
          <p>© 2025 Read2Learn. Master languages through authentic reading.</p>
        </div>
      </footer>
    </div>
  );
}
