"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  TrendingUp,
  Sparkles,
  Headphones,
  BookMarked,
  ArrowRight,
  Zap,
  Languages,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";

function FloatingOrbs() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {/* Large gradient orbs – indigo + teal family only */}
      <div className='animate-blob absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[oklch(0.48_0.16_255/0.08)] blur-3xl' />
      <div
        className='animate-blob absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-[oklch(0.58_0.14_175/0.06)] blur-3xl'
        style={{ animationDelay: "2s" }}
      />
      <div
        className='animate-blob absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[oklch(0.55_0.12_220/0.06)] blur-3xl'
        style={{ animationDelay: "4s" }}
      />
      {/* Floating dots */}
      <div
        className='animate-float bg-primary/30 absolute left-[15%] top-[20%] h-2 w-2 rounded-full'
        style={{ animationDelay: "0s" }}
      />
      <div
        className='animate-float-slow bg-accent/30 absolute left-[75%] top-[15%] h-3 w-3 rounded-full'
        style={{ animationDelay: "1s" }}
      />
      <div
        className='animate-float-reverse bg-primary/20 absolute left-[55%] top-[70%] h-2 w-2 rounded-full'
        style={{ animationDelay: "2s" }}
      />
      <div
        className='animate-float bg-accent/25 absolute left-[85%] top-[60%] h-1.5 w-1.5 rounded-full'
        style={{ animationDelay: "3s" }}
      />
      <div
        className='animate-float-slow bg-primary/25 absolute left-[25%] top-[80%] h-2.5 w-2.5 rounded-full'
        style={{ animationDelay: "1.5s" }}
      />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: string;
  gradient: string;
}) {
  return (
    <div
      className='card-hover card-shine border-border/50 bg-card/80 group relative flex flex-col items-center rounded-2xl border p-8 text-center backdrop-blur-sm'
      style={{ animationDelay: delay }}
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className='h-7 w-7 text-white' />
      </div>
      <h3 className='mb-3 text-lg font-bold'>{title}</h3>
      <p className='text-muted-foreground text-sm leading-relaxed'>
        {description}
      </p>
    </div>
  );
}

function StepItem({
  number,
  title,
  description,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  delay: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className='reveal flex gap-5'
      style={{ transitionDelay: delay }}
    >
      <div className='gradient-bg-animated relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg'>
        {number}
        <div className='animate-pulse-glow absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100' />
      </div>
      <div className='flex-1'>
        <h3 className='mb-2 text-lg font-bold'>{title}</h3>
        <p className='text-muted-foreground leading-relaxed'>{description}</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  const t = useTranslations("LandingPage");
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className='bg-background relative min-h-screen overflow-hidden'>
      <FloatingOrbs />

      {/* Header */}
      <header className='glass-strong border-border/50 sticky top-0 z-50 border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='gradient-bg flex h-9 w-9 items-center justify-center rounded-xl shadow-md'>
                <BookOpen className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold tracking-tight'>
                Read2Learn
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <ThemeToggle />
              <Button variant='ghost' asChild className='hidden sm:inline-flex'>
                <Link href='/auth/login'>{t("login")}</Link>
              </Button>
              <Button
                asChild
                className='gradient-bg border-0 text-white shadow-md hover:shadow-lg hover:brightness-110'
              >
                <Link href='/auth/register'>{t("getStarted")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className='container relative mx-auto px-4 py-24 md:py-36'
      >
        <div className='mx-auto max-w-4xl text-center'>
          {/* Pill badge */}
          <div className='animate-slide-down border-primary/20 bg-primary/5 text-primary mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium'>
            <Sparkles className='h-4 w-4' />
            <span>{t("badge")}</span>
            <Zap className='h-3.5 w-3.5' />
          </div>

          <h1 className='animate-slide-up mb-6 text-balance text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl'>
            {t("heroTitle")}{" "}
            <span className='gradient-text'>{t("heroHighlight")}</span>
          </h1>

          <p
            className='animate-slide-up text-muted-foreground mx-auto mb-10 max-w-2xl text-pretty text-xl leading-relaxed'
            style={{ animationDelay: "0.15s" }}
          >
            {t("heroDescription")}
          </p>

          <div
            className='animate-slide-up flex flex-col justify-center gap-4 sm:flex-row'
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              size='lg'
              asChild
              className='gradient-bg group h-12 border-0 px-8 text-base text-white shadow-lg hover:shadow-xl hover:brightness-110'
            >
              <Link href='/auth/register'>
                {t("startLearningFree")}
                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
            <Button
              size='lg'
              variant='outline'
              asChild
              className='h-12 px-8 text-base'
            >
              <Link href='/auth/login'>{t("signIn")}</Link>
            </Button>
          </div>

          {/* Stats row */}
          <div
            className='animate-slide-up mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16'
            style={{ animationDelay: "0.45s" }}
          >
            <div className='text-center'>
              <div className='gradient-text text-3xl font-extrabold'>20+</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {t("statsLanguages")}
              </div>
            </div>
            <div className='bg-border h-8 w-px' />
            <div className='text-center'>
              <div className='gradient-text text-3xl font-extrabold'>AI</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {t("statsGenerated")}
              </div>
            </div>
            <div className='bg-border h-8 w-px' />
            <div className='text-center'>
              <div className='gradient-text text-3xl font-extrabold'>100%</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {t("statsPersonalized")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='container relative mx-auto px-4 py-20'>
        <div className='reveal mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-extrabold md:text-4xl'>
            {t("featuresTitle")}{" "}
            <span className='gradient-text'>{t("featuresHighlight")}</span>
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            {t("featuresDesc")}
          </p>
        </div>

        <div className='mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <FeatureCard
            icon={Languages}
            title={t("multipleLanguages")}
            description={t("multipleLanguagesDesc")}
            delay='0s'
            gradient='bg-linear-to-br from-[oklch(0.45_0.16_255)] to-[oklch(0.50_0.15_245)]'
          />
          <FeatureCard
            icon={Brain}
            title={t("aiPoweredLearning")}
            description={t("aiPoweredLearningDesc")}
            delay='0.1s'
            gradient='bg-linear-to-br from-[oklch(0.48_0.14_240)] to-[oklch(0.52_0.13_230)]'
          />
          <FeatureCard
            icon={TrendingUp}
            title={t("trackProgress")}
            description={t("trackProgressDesc")}
            delay='0.2s'
            gradient='bg-linear-to-br from-[oklch(0.55_0.14_175)] to-[oklch(0.58_0.13_165)]'
          />
          <FeatureCard
            icon={BookMarked}
            title={t("smartDictionary")}
            description={t("smartDictionaryDesc")}
            delay='0.3s'
            gradient='bg-linear-to-br from-[oklch(0.52_0.13_210)] to-[oklch(0.55_0.12_200)]'
          />
          <FeatureCard
            icon={Headphones}
            title={t("listenAndLearn")}
            description={t("listenAndLearnDesc")}
            delay='0.4s'
            gradient='bg-linear-to-br from-[oklch(0.56_0.13_195)] to-[oklch(0.53_0.14_185)]'
          />
          <FeatureCard
            icon={Sparkles}
            title={t("interactiveExercises")}
            description={t("interactiveExercisesDesc")}
            delay='0.5s'
            gradient='bg-linear-to-br from-[oklch(0.50_0.15_260)] to-[oklch(0.55_0.14_250)]'
          />
        </div>
      </section>

      {/* How It Works */}
      <section className='container relative mx-auto px-4 py-20'>
        <div className='mx-auto max-w-3xl'>
          <div className='reveal mb-14 text-center'>
            <h2 className='mb-4 text-3xl font-extrabold md:text-4xl'>
              {t("howItWorks")}
            </h2>
            <p className='text-muted-foreground text-lg'>
              {t("startInMinutes")}
            </p>
          </div>

          <div className='space-y-10'>
            <StepItem
              number={1}
              title={t("step1Title")}
              description={t("step1Desc")}
              delay='0s'
            />
            <StepItem
              number={2}
              title={t("step2Title")}
              description={t("step2Desc")}
              delay='0.15s'
            />
            <StepItem
              number={3}
              title={t("step3Title")}
              description={t("step3Desc")}
              delay='0.3s'
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='container mx-auto px-4 py-20'>
        <div className='reveal border-primary/10 relative mx-auto max-w-3xl overflow-hidden rounded-3xl border p-12 text-center'>
          {/* Background gradient */}
          <div className='bg-linear-to-br from-primary/5 to-accent/5 absolute inset-0 via-transparent' />
          <div className='bg-primary/5 absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl' />
          <div className='bg-accent/5 absolute -bottom-20 -left-20 h-60 w-60 rounded-full blur-3xl' />

          <div className='relative'>
            <div
              className='animate-bounce-subtle gradient-bg mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg'
              aria-hidden='true'
            >
              <Sparkles className='h-8 w-8 text-white' />
            </div>
            <h2 className='mb-4 text-3xl font-extrabold md:text-4xl'>
              {t("readyToStart")}
            </h2>
            <p className='text-muted-foreground mx-auto mb-8 max-w-lg text-lg'>
              {t("readyToStartDesc")}
            </p>
            <Button
              size='lg'
              asChild
              className='gradient-bg group h-12 border-0 px-8 text-base text-white shadow-lg hover:shadow-xl hover:brightness-110'
            >
              <Link href='/auth/register'>
                {t("createFreeAccount")}
                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-border/50 border-t py-8'>
        <div className='text-muted-foreground container mx-auto px-4 text-center text-sm'>
          <p>{t("footer")}</p>
        </div>
      </footer>
    </div>
  );
}
