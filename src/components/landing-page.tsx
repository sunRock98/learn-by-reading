"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe, Brain, TrendingUp, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function LandingPage() {
  const t = useTranslations("LandingPage");

  return (
    <div className='from-background to-muted/20 min-h-screen bg-gradient-to-b'>
      {/* Header */}
      <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <BookOpen className='text-primary h-6 w-6' />
              <span className='text-xl font-bold'>Read2Learn</span>
            </div>
            <div className='flex items-center gap-3'>
              <Button variant='ghost' asChild>
                <Link href='/auth/login'>{t("login")}</Link>
              </Button>
              <Button asChild>
                <Link href='/auth/sign-up'>{t("getStarted")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-20 md:py-32'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='mb-6 text-balance text-5xl font-bold md:text-6xl'>
            {t("heroTitle")}{" "}
            <span className='text-primary'>{t("heroHighlight")}</span>
          </h1>
          <p className='text-muted-foreground mb-8 text-pretty text-xl'>
            {t("heroDescription")}
          </p>
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <Button size='lg' asChild>
              <Link href='/auth/sign-up'>{t("startLearningFree")}</Link>
            </Button>
            <Button size='lg' variant='outline' asChild>
              <Link href='/auth/login'>{t("signIn")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-4 py-20'>
        <div className='mx-auto grid max-w-5xl gap-8 md:grid-cols-3'>
          <div className='bg-card flex flex-col items-center rounded-xl border p-6 text-center'>
            <div className='bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
              <Globe className='text-primary h-6 w-6' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>
              {t("multipleLanguages")}
            </h3>
            <p className='text-muted-foreground text-sm'>
              {t("multipleLanguagesDesc")}
            </p>
          </div>

          <div className='bg-card flex flex-col items-center rounded-xl border p-6 text-center'>
            <div className='bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
              <Brain className='text-primary h-6 w-6' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>
              {t("aiPoweredLearning")}
            </h3>
            <p className='text-muted-foreground text-sm'>
              {t("aiPoweredLearningDesc")}
            </p>
          </div>

          <div className='bg-card flex flex-col items-center rounded-xl border p-6 text-center'>
            <div className='bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
              <TrendingUp className='text-primary h-6 w-6' />
            </div>
            <h3 className='mb-2 text-lg font-semibold'>{t("trackProgress")}</h3>
            <p className='text-muted-foreground text-sm'>
              {t("trackProgressDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='bg-muted/30 container mx-auto px-4 py-20'>
        <div className='mx-auto max-w-4xl'>
          <h2 className='mb-12 text-center text-3xl font-bold'>
            {t("howItWorks")}
          </h2>
          <div className='space-y-8'>
            <div className='flex gap-4'>
              <div className='bg-primary text-primary-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold'>
                1
              </div>
              <div>
                <h3 className='mb-1 text-lg font-semibold'>
                  {t("step1Title")}
                </h3>
                <p className='text-muted-foreground'>{t("step1Desc")}</p>
              </div>
            </div>

            <div className='flex gap-4'>
              <div className='bg-primary text-primary-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold'>
                2
              </div>
              <div>
                <h3 className='mb-1 text-lg font-semibold'>
                  {t("step2Title")}
                </h3>
                <p className='text-muted-foreground'>{t("step2Desc")}</p>
              </div>
            </div>

            <div className='flex gap-4'>
              <div className='bg-primary text-primary-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold'>
                3
              </div>
              <div>
                <h3 className='mb-1 text-lg font-semibold'>
                  {t("step3Title")}
                </h3>
                <p className='text-muted-foreground'>{t("step3Desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='container mx-auto px-4 py-20'>
        <div className='bg-primary/5 mx-auto max-w-3xl rounded-2xl border p-12 text-center'>
          <Sparkles className='text-primary mx-auto mb-4 h-12 w-12' />
          <h2 className='mb-4 text-3xl font-bold'>{t("readyToStart")}</h2>
          <p className='text-muted-foreground mb-8'>{t("readyToStartDesc")}</p>
          <Button size='lg' asChild>
            <Link href='/auth/sign-up'>{t("createFreeAccount")}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t py-8'>
        <div className='text-muted-foreground container mx-auto px-4 text-center text-sm'>
          <p>{t("footer")}</p>
        </div>
      </footer>
    </div>
  );
}
