"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const navItems = ["issue", "method", "archive", "classes"];

type StoryPanel = {
  accent: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

export function LandingPage() {
  const t = useTranslations("LandingPage");
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [activePanel, setActivePanel] = React.useState(0);
  const [navProgress, setNavProgress] = React.useState(0);

  const panels = React.useMemo<StoryPanel[]>(
    () => [
      {
        accent: "#c43a3a",
        eyebrow: t("panel1Eyebrow"),
        title: t("panel1Title"),
        body: t("panel1Body"),
        image: "/landing/editorial-cover-reading.jpg",
        alt: "Editorial illustration of a reader at a cafe table",
      },
      {
        accent: "#4f9077",
        eyebrow: t("panel2Eyebrow"),
        title: t("panel2Title"),
        body: t("panel2Body"),
        image: "/landing/editorial-cover-desk.jpg",
        alt: "Editorial illustration of a language learner's desk",
      },
      {
        accent: "#e7b7aa",
        eyebrow: t("panel3Eyebrow"),
        title: t("panel3Title"),
        body: t("panel3Body"),
        image: "/landing/editorial-cover-archive.jpg",
        alt: "Editorial illustration of archive cards and books",
      },
    ],
    [t]
  );

  React.useEffect(() => {
    let frame = 0;

    const updateScrollState = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
      document.documentElement.style.setProperty(
        "--hero-scroll",
        Math.min(window.scrollY, window.innerHeight).toFixed(1)
      );
      const navRevealStart = window.innerHeight * 0.82;
      const navRevealEnd = window.innerHeight * 0.92;
      setNavProgress(
        Math.max(
          0,
          Math.min(
            1,
            (window.scrollY - navRevealStart) / (navRevealEnd - navRevealStart)
          )
        )
      );
      const navProgressValue = Math.max(
        0,
        Math.min(
          1,
          (window.scrollY - navRevealStart) / (navRevealEnd - navRevealStart)
        )
      );
      document.documentElement.style.setProperty(
        "--compact-nav-offset",
        `${(-100 + navProgressValue * 100).toFixed(1)}%`
      );
      document.documentElement.style.setProperty(
        "--compact-nav-opacity",
        navProgressValue.toFixed(3)
      );

      const viewportCenter = window.innerHeight * 0.55;
      const storyPanels = Array.from(
        document.querySelectorAll<HTMLElement>("[data-story-panel]")
      );

      const nextActive = storyPanels.findIndex((panel) => {
        const rect = panel.getBoundingClientRect();
        const progress =
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        panel.style.setProperty(
          "--panel-progress",
          Math.max(0, Math.min(1, progress)).toFixed(3)
        );

        return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
      });

      if (nextActive >= 0) {
        setActivePanel(nextActive);
      }
    };

    const update = () => {
      if (typeof window.requestAnimationFrame === "function") {
        cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(updateScrollState);
        return;
      }

      updateScrollState();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      if (typeof window.cancelAnimationFrame === "function") {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollToPanel = (index: number) => {
    const storyPanels =
      document.querySelectorAll<HTMLElement>("[data-story-panel]");

    storyPanels[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main
      className='min-h-screen bg-[#f7f1e3] text-[#10100f]'
      style={
        {
          "--landing-scroll": scrollProgress,
        } as React.CSSProperties & Record<string, number>
      }
    >
      <CompactNavOverlay
        masthead={t("heroMasthead")}
        login={t("login")}
        getStarted={t("getStarted")}
        navProgress={navProgress}
        onNavClick={scrollToPanel}
      />

      <section className='relative isolate h-[180svh] border-b border-[#1a1a18]/15 bg-[#f7f1e3]'>
        <Header
          variant='hero'
          masthead={t("heroMasthead")}
          login={t("login")}
          getStarted={t("getStarted")}
          navProgress={navProgress}
        />

        <div className='sticky top-0 h-[100svh] overflow-hidden'>
          <HeroImage
            masthead={t("heroMasthead")}
            headline={t("heroHeadline")}
            tagline={t("heroTagline")}
          />

          <div className='absolute inset-x-0 bottom-5 z-30 flex justify-center px-6'>
            <Link
              href='/onboarding'
              className='pointer-events-auto inline-flex items-center gap-2 rounded-md border border-[#10100f] bg-[#10100f] px-4 py-2 text-sm font-semibold text-[#f7f1e3] transition hover:bg-[#c43a3a]'
            >
              {t("startLearningFree")}
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </div>
      </section>

      <section className='relative overflow-hidden bg-[#fbf8ee] py-20 md:py-28'>
        <CornerSketch side='left' />
        <CornerSketch side='right' />
        <div className='mx-auto max-w-3xl px-6 text-center'>
          <p className='font-serif text-[clamp(1.8rem,3.6vw,3.25rem)] leading-tight'>
            {t("editorLetter")}
          </p>
          <p className='mt-7 font-serif text-xl italic text-[#534f45]'>
            {t("editorSignoff")}
          </p>
        </div>
      </section>

      <section className='bg-[#fbf8ee]'>
        {panels.map((panel, index) => (
          <StorySection
            key={panel.title}
            panel={panel}
            index={index}
            isActive={activePanel === index}
            cta={index === 0 ? t("readIssue") : t("startLearningFree")}
          />
        ))}
      </section>

      <section className='relative isolate min-h-[78svh] overflow-hidden border-y border-[#1a1a18]/15 bg-[#f7f1e3]'>
        <Image
          src='/landing/editorial-hero.jpg'
          alt=''
          fill
          sizes='100vw'
          className='z-0 object-cover object-center opacity-80'
        />
        <div className='absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(247,241,227,0.96)_0%,rgba(247,241,227,0.78)_34%,rgba(247,241,227,0.28)_62%,rgba(247,241,227,0.08)_100%)]' />
        <div className='absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-[#f7f1e3] to-transparent' />

        <div className='relative z-20 flex min-h-[78svh] items-end px-6 py-16 md:items-center md:px-10 md:py-24'>
          <div className='max-w-2xl'>
            <p className='mb-4 font-serif text-sm uppercase tracking-[0.18em] text-[#4f9077]'>
              {t("readyEyebrow")}
            </p>
            <h2 className='font-serif text-[clamp(2.75rem,8vw,6.75rem)] uppercase leading-[0.86] text-[#10100f]'>
              {t("readyToStart")}
            </h2>
            <p className='mt-6 max-w-xl font-serif text-[clamp(1.15rem,2.4vw,1.65rem)] italic leading-snug text-[#3f3a32]'>
              {t("readyToStartDesc")}
            </p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <Button
                asChild
                className='rounded-md bg-[#10100f] text-[#fbf8ee] hover:bg-[#c43a3a]'
              >
                <Link href='/onboarding'>{t("createFreeAccount")}</Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='rounded-md border-[#10100f] bg-[#f7f1e3]/65 hover:bg-[#fbf8ee]'
              >
                <Link href='/auth/login'>{t("signIn")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className='bg-[#fbf8ee] px-6 py-8 text-center font-serif text-sm text-[#5b5549]'>
        {t("footer")}
      </footer>
    </main>
  );
}

function Header({
  variant,
  masthead,
  login,
  getStarted,
  navProgress,
}: {
  variant: "hero" | "compact";
  masthead: string;
  login: string;
  getStarted: string;
  navProgress?: number;
}) {
  const heroOpacity =
    variant === "hero" ? Math.max(0, 1 - (navProgress ?? 0) * 1.4) : 1;

  return (
    <header
      className={
        variant === "hero"
          ? "fixed inset-x-0 top-0 z-40 px-5 py-4"
          : "px-5 py-3"
      }
      style={{
        opacity: heroOpacity,
        pointerEvents: heroOpacity > 0.05 ? "auto" : "none",
      }}
    >
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-4'>
        <button
          type='button'
          aria-label='Menu'
          className='flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-[#1a1a18]/10'
        >
          <Menu className='h-6 w-6' />
        </button>

        {variant === "compact" && (
          <Link
            href='/'
            className='absolute left-1/2 flex -translate-x-1/2 items-baseline gap-2 font-serif text-2xl uppercase leading-none md:text-3xl'
          >
            <span>{masthead}</span>
          </Link>
        )}

        <div className='ml-auto flex items-center gap-2'>
          <Button
            asChild
            variant={variant === "hero" ? "ghost" : "outline"}
            size='sm'
            className='hidden rounded-md border-[#10100f] bg-transparent font-semibold hover:bg-[#fbf8ee] sm:inline-flex'
          >
            <Link href='/auth/login'>{login}</Link>
          </Button>
          <Button
            asChild
            size='sm'
            className='rounded-md bg-[#10100f] text-[#fbf8ee] hover:bg-[#c43a3a]'
          >
            <Link href='/onboarding'>{getStarted}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function CompactNavOverlay({
  masthead,
  login,
  getStarted,
  navProgress,
  onNavClick,
}: {
  masthead: string;
  login: string;
  getStarted: string;
  navProgress: number;
  onNavClick: (index: number) => void;
}) {
  const t = useTranslations("LandingPage");

  return (
    <div
      className='fixed inset-x-0 top-0 z-50 border-b border-[#1a1a18]/15 bg-[#fbf8ee]/95 backdrop-blur'
      style={{
        opacity: "var(--compact-nav-opacity, 0)",
        pointerEvents: navProgress > 0.02 ? "auto" : "none",
        transform: "translate3d(0, var(--compact-nav-offset, -100%), 0)",
      }}
    >
      <Header
        variant='compact'
        masthead={masthead}
        login={login}
        getStarted={getStarted}
      />
      <nav className='hidden justify-center border-t border-[#1a1a18]/10 text-[0.72rem] font-medium uppercase md:flex'>
        {navItems.map((item, index) => (
          <button
            key={item}
            type='button'
            onClick={() => onNavClick(index)}
            className='border-r border-[#1a1a18]/10 px-5 py-3 transition hover:bg-[#efe7d4]'
          >
            {t(`nav${index + 1}`)}
          </button>
        ))}
      </nav>
    </div>
  );
}

function HeroImage({
  masthead,
  headline,
  tagline,
}: {
  masthead: string;
  headline: string;
  tagline: string;
}) {
  const heroImageStyle = {
    transform:
      "translate3d(0, calc(var(--hero-scroll, 0) * -0.24px), 0) scale(calc(1.035 + var(--hero-scroll, 0) * 0.00008))",
    transformOrigin: "50% 58%",
  } satisfies React.CSSProperties;

  return (
    <div className='absolute inset-0 overflow-hidden bg-[#f7f1e3]'>
      <div
        aria-hidden='true'
        className='absolute inset-x-[-9vw] bottom-[-14vh] top-0 z-0 md:bottom-[-18vh]'
        style={heroImageStyle}
      >
        <Image
          src='/landing/editorial-hero.jpg'
          alt=''
          fill
          priority
          sizes='100vw'
          className='object-cover object-center'
        />
      </div>

      <div
        className='pointer-events-none absolute inset-x-0 top-[9svh] z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center sm:top-[8svh]'
        style={{
          transform:
            "translate3d(0, calc(var(--hero-scroll, 0) * -0.035px), 0)",
        }}
      >
        <p className='font-serif text-[clamp(1.35rem,3.2vw,2.05rem)] uppercase leading-none'>
          {masthead}
        </p>
        <h1 className='mt-2 max-w-4xl font-serif text-[clamp(3rem,9.8vw,8.5rem)] font-normal uppercase leading-[0.84] text-[#c43a3a]'>
          {headline}
        </h1>
        <p className='mt-4 max-w-2xl px-3 font-serif text-[clamp(1rem,2.2vw,1.45rem)] italic leading-snug text-[#3d3a32]'>
          {tagline}
        </p>
      </div>

      <div
        aria-hidden='true'
        data-hero-foreground
        className='absolute inset-x-[-9vw] bottom-[-16vh] top-0 z-20 hidden md:block md:bottom-[-20vh]'
        style={{
          transform:
            "translate3d(0, calc(48svh + var(--hero-scroll, 0) * -0.74px), 0) scale(calc(0.76 + var(--hero-scroll, 0) * 0.00034))",
          transformOrigin: "50% 58%",
        }}
      >
        <Image
          src='/landing/editorial-hero-foreground.png'
          alt=''
          fill
          priority
          sizes='100vw'
          className='object-cover object-center'
        />
      </div>

      <div className='pointer-events-none absolute inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t from-[#f7f1e3] to-transparent' />
    </div>
  );
}

function CornerSketch({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden='true'
      className={
        side === "left"
          ? "absolute left-0 top-0 hidden h-52 w-60 md:block"
          : "absolute right-0 top-0 hidden h-52 w-60 md:block"
      }
    >
      <svg className='h-full w-full' viewBox='0 0 240 208'>
        <path
          d={
            side === "left"
              ? "M0 22 L178 122 M0 87 L122 168"
              : "M240 22 L62 122 M240 87 L118 168"
          }
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
        />
        <path
          d='M88 62 q16 -24 33 0 t33 0'
          fill='none'
          stroke='#4f9077'
          strokeWidth='10'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
}

function StorySection({
  panel,
  index,
  isActive,
  cta,
}: {
  panel: StoryPanel;
  index: number;
  isActive: boolean;
  cta: string;
}) {
  const flip = index % 2 === 1;

  return (
    <article
      data-story-panel
      className='min-h-[92svh] border-t border-[#1a1a18]/15 px-5 py-12 md:px-10 md:py-20'
      style={
        {
          "--panel-progress": 0,
        } as React.CSSProperties & Record<string, number>
      }
    >
      <div
        className={`mx-auto grid max-w-7xl items-start gap-8 md:grid-cols-[minmax(300px,0.95fr)_minmax(320px,1.05fr)] md:gap-14 ${
          flip ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className='sticky top-28 self-start'>
          <IllustrationCard panel={panel} />
        </div>
        <div className='flex min-h-[70svh] flex-col items-center justify-center text-center'>
          <p className='font-serif text-lg italic text-[#5a554a]'>
            {panel.eyebrow}
          </p>
          <h2 className='mt-8 max-w-2xl font-serif text-[clamp(2.5rem,6vw,5.9rem)] uppercase leading-[0.96]'>
            {panel.title}
          </h2>
          <p className='mt-8 max-w-2xl font-serif text-xl leading-relaxed md:text-2xl'>
            {panel.body}
          </p>
          <Link
            href='/onboarding'
            className='mt-10 inline-flex items-center gap-2 text-sm font-bold'
          >
            {cta}
            <ArrowRight className='h-4 w-4' />
          </Link>

          <div className='mt-16 flex gap-4' aria-hidden='true'>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive && dot === index ? "bg-[#10100f]" : "bg-[#dfd8c8]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function IllustrationCard({ panel }: { panel: StoryPanel }) {
  return (
    <div className='overflow-hidden rounded-md border border-[#10100f] bg-[#fbf8ee] shadow-[8px_8px_0_#10100f]'>
      <div className='flex items-center justify-between border-b border-[#10100f] px-4 py-2 font-serif text-sm'>
        <span>Read2Learn</span>
        <span style={{ color: panel.accent }}>Vol. 01</span>
      </div>
      <div
        className='relative aspect-[4/5] overflow-hidden'
        style={{
          transform:
            "translate3d(0, calc((var(--panel-progress) - 0.5) * -28px), 0)",
        }}
      >
        <Image
          src={panel.image}
          alt={panel.alt}
          fill
          sizes='(min-width: 768px) 42vw, 90vw'
          className='object-cover transition-transform duration-300 ease-out'
          style={{
            transform:
              "scale(1.08) translate3d(0, calc((var(--panel-progress) - 0.5) * 36px), 0)",
          }}
        />
      </div>
    </div>
  );
}
