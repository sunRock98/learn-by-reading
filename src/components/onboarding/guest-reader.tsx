"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Sparkles,
  Loader2,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getGuestTexts,
  getGuestInterests,
  getGuestLanguage,
  getGuestLevel,
  addGuestText,
  canGuestGenerateText,
  MAX_GUEST_TEXTS,
  type GuestText,
} from "@/lib/guest-storage";
import { useTranslations } from "next-intl";

interface GuestReaderProps {
  textId?: string;
}

export function GuestReader({ textId }: GuestReaderProps) {
  const t = useTranslations("GuestReader");
  const router = useRouter();
  const [texts, setTexts] = useState<GuestText[]>([]);
  const [currentText, setCurrentText] = useState<GuestText | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedTexts = getGuestTexts();
    setTexts(savedTexts);

    if (textId) {
      const found = savedTexts.find((tx) => tx.id === textId);
      if (found) {
        setCurrentText(found);
      } else if (savedTexts.length > 0) {
        setCurrentText(savedTexts[savedTexts.length - 1]);
      }
    } else if (savedTexts.length > 0) {
      setCurrentText(savedTexts[savedTexts.length - 1]);
    }
  }, [textId]);

  const currentIndex = currentText
    ? texts.findIndex((tx) => tx.id === currentText.id)
    : -1;

  const handleWordClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const target = e.currentTarget;
      const word = target.textContent || "";
      const cleanedWord = word
        .toLowerCase()
        .replace(/[.,!?;:'"()«»—–]/g, "")
        .trim();

      if (!cleanedWord || !currentText) return;

      const translation = currentText.translations.find(
        (tr) =>
          tr.word.toLowerCase() === cleanedWord ||
          tr.word.toLowerCase().includes(cleanedWord)
      );

      if (translation) {
        target.setAttribute("title", translation.translation);
        target.classList.add("bg-primary/20");

        const tooltip = document.createElement("div");
        tooltip.className =
          "fixed z-50 bg-card border rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none animate-in fade-in zoom-in-95";
        tooltip.innerHTML = `<span class="font-medium">${translation.word}</span> → <span class="text-primary">${translation.translation}</span>`;

        const rect = target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 8}px`;
        tooltip.style.transform = "translate(-50%, -100%)";

        document.body.appendChild(tooltip);

        setTimeout(() => {
          tooltip.classList.add("opacity-0");
          tooltip.style.transition = "opacity 0.3s";
          setTimeout(() => tooltip.remove(), 300);
        }, 2000);
      }
    },
    [currentText]
  );

  const renderInteractiveText = useCallback(
    (content: string) => {
      const words = content.split(/(\s+)/);

      return words.map((word, index) => {
        if (word.trim() === "") {
          return <span key={index}>{word}</span>;
        }

        const hasLetters = /[a-zA-ZÀ-ÿА-яЁё]/.test(word);

        if (!hasLetters) {
          return <span key={index}>{word}</span>;
        }

        return (
          <span
            key={index}
            onClick={handleWordClick}
            className='hover:bg-accent/30 hover:text-accent-foreground cursor-pointer rounded px-0.5 transition-colors'
            role='button'
            tabIndex={0}
          >
            {word}
          </span>
        );
      });
    },
    [handleWordClick]
  );

  const handleGenerateNext = () => {
    if (!canGuestGenerateText()) {
      setShowSignupPrompt(true);
      return;
    }

    const language = getGuestLanguage();
    const level = getGuestLevel();
    const interests = getGuestInterests();

    if (!language || !level) {
      router.push("/onboarding");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const topic =
          interests.length > 0
            ? interests[Math.floor(Math.random() * interests.length)]
            : undefined;

        const res = await fetch("/api/guest/generate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: language.name,
            level: level.name,
            topic,
            interests,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.requiresAuth) {
            setShowSignupPrompt(true);
            return;
          }
          setError(data.error || t("failedGenerate"));
          return;
        }

        const guestText: GuestText = {
          id: crypto.randomUUID(),
          title: data.title,
          content: data.text,
          translations: data.translations || [],
          createdAt: new Date().toISOString(),
          topic,
        };

        addGuestText(guestText);
        setTexts((prev) => [...prev, guestText]);
        setCurrentText(guestText);
        router.push(`/guest/reading/${guestText.id}`);
      } catch {
        setError(t("sthWentWrong"));
      }
    });
  };

  const navigateText = (direction: "prev" | "next") => {
    if (direction === "prev" && currentIndex > 0) {
      const prevText = texts[currentIndex - 1];
      setCurrentText(prevText);
      router.push(`/guest/reading/${prevText.id}`);
    } else if (direction === "next" && currentIndex < texts.length - 1) {
      const nextText = texts[currentIndex + 1];
      setCurrentText(nextText);
      router.push(`/guest/reading/${nextText.id}`);
    }
  };

  if (!currentText && texts.length === 0) {
    return (
      <div className='from-background to-muted/20 min-h-screen bg-gradient-to-b'>
        <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <Link href='/' className='flex items-center gap-2'>
                <BookOpen className='text-primary h-6 w-6' />
                <span className='text-xl font-bold'>Read2Learn</span>
              </Link>
              <div className='flex items-center gap-3'>
                <ThemeToggle />
                <Button variant='outline' size='sm' asChild>
                  <Link href='/auth/login'>{t("signIn")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className='container mx-auto px-4 py-20 text-center'>
          <h1 className='mb-4 text-2xl font-bold'>{t("noTexts")}</h1>
          <p className='text-muted-foreground mb-8'>
            {t("noTextsDescription")}
          </p>
          <Button asChild>
            <Link href='/onboarding'>{t("getStarted")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='from-background to-muted/20 min-h-screen bg-gradient-to-b'>
      <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link href='/' className='flex items-center gap-2'>
              <BookOpen className='text-primary h-6 w-6' />
              <span className='text-xl font-bold'>Read2Learn</span>
            </Link>
            <div className='flex items-center gap-3'>
              <ThemeToggle />
              <span className='text-muted-foreground hidden text-sm sm:inline'>
                {t("freeTexts", {
                  count: texts.length,
                  max: MAX_GUEST_TEXTS,
                })}
              </span>
              <Button variant='outline' size='sm' asChild>
                <Link href='/auth/register'>{t("signUpFree")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showSignupPrompt && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <Card className='mx-4 max-w-md p-8 text-center'>
            <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
              <Lock className='text-primary h-8 w-8' />
            </div>
            <h2 className='mb-2 text-2xl font-bold'>{t("reachedLimit")}</h2>
            <p className='text-muted-foreground mb-6'>
              {t("reachedLimitDescription", { max: MAX_GUEST_TEXTS })}
            </p>
            <div className='flex flex-col gap-3'>
              <Button size='lg' asChild>
                <Link href='/auth/register'>{t("createFreeAccount")}</Link>
              </Button>
              <Button
                size='lg'
                variant='outline'
                onClick={() => setShowSignupPrompt(false)}
              >
                {t("continueReading")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className='container mx-auto max-w-4xl px-4 py-6'>
        {currentText && (
          <>
            <Card className='mb-6 overflow-hidden border-0 bg-[#fffef8] shadow-lg dark:bg-[#1a1a18]'>
              <div className='flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16'>
                <span className='mb-6 font-serif text-sm font-medium uppercase tracking-[0.25em] text-[#c41e3a]'>
                  {getGuestLanguage()?.name} · {getGuestLevel()?.name}
                </span>

                <h1 className='mb-6 font-serif text-3xl font-normal uppercase leading-[1.1] tracking-[-0.02em] text-[#1a1a18] md:text-4xl lg:text-5xl dark:text-[#e8e6dc]'>
                  {currentText.title}
                </h1>

                <p className='font-serif text-lg italic text-[#5a5a52] dark:text-[#9a9a8f]'>
                  {t("clickToTranslate")}
                </p>
              </div>

              <div className='flex items-center justify-center gap-4 px-8 py-6'>
                <div className='h-px flex-1 bg-[#d4d0c4] dark:bg-[#3a3a38]' />
                <div className='h-2 w-2 rotate-45 bg-[#c41e3a]' />
                <div className='h-px flex-1 bg-[#d4d0c4] dark:bg-[#3a3a38]' />
              </div>

              <div className='px-8 pb-8 md:px-12 lg:px-16'>
                <div className='mx-auto max-w-2xl'>
                  <div className='font-serif text-lg leading-[1.9] text-[#1a1a18] dark:text-[#e8e6dc]'>
                    <div className='whitespace-pre-line'>
                      {renderInteractiveText(currentText.content)}
                    </div>
                  </div>
                </div>
              </div>

              {currentText.translations.length > 0 && (
                <div className='border-t border-[#d4d0c4] bg-[#f5f3e8] px-8 py-6 dark:border-[#3a3a38] dark:bg-[#151513]'>
                  <h3 className='mb-3 font-serif text-sm font-medium uppercase tracking-widest text-[#8a8677] dark:text-[#6a6a5f]'>
                    {t("keyVocabulary")}
                  </h3>
                  <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                    {currentText.translations.map((tr, i) => (
                      <div key={i} className='flex items-center gap-2 text-sm'>
                        <span className='font-serif font-medium text-[#1a1a18] dark:text-[#e8e6dc]'>
                          {tr.word}
                        </span>
                        <span className='text-[#8a8677] dark:text-[#6a6a5f]'>
                          →
                        </span>
                        <span className='text-primary font-medium'>
                          {tr.translation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className='border-t border-[#d4d0c4] bg-[#f5f3e8] px-8 py-4 dark:border-[#3a3a38] dark:bg-[#151513]'>
                <div className='flex items-center justify-center gap-2 font-serif text-xs uppercase tracking-widest text-[#8a8677] dark:text-[#6a6a5f]'>
                  <span>◆</span>
                  <span>Learn by Reading</span>
                  <span>◆</span>
                </div>
              </div>
            </Card>

            <div className='flex items-center justify-between'>
              <div className='flex gap-2'>
                {currentIndex > 0 && (
                  <Button
                    variant='outline'
                    onClick={() => navigateText("prev")}
                    className='gap-1'
                  >
                    <ChevronLeft className='h-4 w-4' />
                    {t("previous")}
                  </Button>
                )}
                {currentIndex < texts.length - 1 && (
                  <Button
                    variant='outline'
                    onClick={() => navigateText("next")}
                    className='gap-1'
                  >
                    {t("next")}
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                )}
              </div>

              <Button
                onClick={handleGenerateNext}
                disabled={isPending}
                className='gap-2'
              >
                {isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4' />
                    {t("generateNew")}
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className='mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
                {error}
              </div>
            )}

            <Card className='bg-primary/5 mt-8 border p-6 text-center'>
              <h3 className='mb-2 text-lg font-semibold'>
                {t("enjoyingExperience")}
              </h3>
              <p className='text-muted-foreground mb-4 text-sm'>
                {t("enjoyingDescription")}
              </p>
              <Button asChild>
                <Link href='/auth/register'>{t("createFreeAccount")}</Link>
              </Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
