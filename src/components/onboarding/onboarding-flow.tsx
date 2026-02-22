"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FloatingInterests } from "./floating-interests";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  setGuestInterests,
  setGuestLanguage,
  setGuestLevel,
  setOnboardingComplete,
  getGuestInterests,
  getGuestLanguage,
  getGuestLevel,
  addGuestText,
  getGuestTextCount,
  clearGuestData,
  type GuestText,
} from "@/lib/guest-storage";
import { saveUserInterests } from "@/actions/save-user-interests";
import { addCourseToUser } from "@/actions/add-course-to-user";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  BookOpen,
  Globe,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslations } from "next-intl";

interface Language {
  id: number;
  name: string;
  code: string;
}

interface Level {
  id: number;
  name: string;
}

interface OnboardingFlowProps {
  languages: Language[];
  levels: Level[];
  isAuthenticated?: boolean;
  userName?: string | null;
  userInterests?: string[];
  userHasCourses?: boolean;
}

export function OnboardingFlow({
  languages,
  levels,
  isAuthenticated = false,
  userName,
  userInterests = [],
  userHasCourses = false,
}: OnboardingFlowProps) {
  const t = useTranslations("Onboarding");
  const totalSteps = isAuthenticated && userHasCourses ? 1 : 2;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>(userInterests);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedInterests = getGuestInterests();
    const savedLanguage = getGuestLanguage();
    const savedLevel = getGuestLevel();

    if (!isAuthenticated) {
      if (savedInterests.length > 0) setInterests(savedInterests);
      if (savedLanguage) setSelectedLanguage(savedLanguage.id.toString());
      if (savedLevel) setSelectedLevel(savedLevel.id.toString());
    } else {
      if (savedInterests.length > 0 && userInterests.length === 0) {
        setInterests(savedInterests);
      }
      if (savedLanguage && !selectedLanguage) {
        setSelectedLanguage(savedLanguage.id.toString());
      }
      if (savedLevel && !selectedLevel) {
        setSelectedLevel(savedLevel.id.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const language = languages.find((l) => l.id.toString() === selectedLanguage);
  const level = levels.find((l) => l.id.toString() === selectedLevel);

  const canProceedStep1 = interests.length >= 1;
  const canProceedStep2 = !!selectedLanguage && !!selectedLevel;

  const handleStep1Next = () => {
    if (!isAuthenticated) {
      setGuestInterests(interests);
      setStep(2);
      return;
    }

    if (userHasCourses) {
      setError(null);
      startTransition(async () => {
        try {
          const result = await saveUserInterests(interests);
          if (result.error) {
            setError(result.error);
            return;
          }
          clearGuestData();
          router.push("/dashboard");
          router.refresh();
        } catch {
          setError(t("sthWentWrong"));
        }
      });
      return;
    }

    setStep(2);
  };

  const handleComplete = () => {
    if (!language || !level) return;
    setError(null);

    if (isAuthenticated) {
      handleAuthenticatedComplete();
    } else {
      handleGuestComplete();
    }
  };

  const handleAuthenticatedComplete = () => {
    startTransition(async () => {
      try {
        const interestResult = await saveUserInterests(interests);
        if (interestResult.error) {
          setError(interestResult.error);
          return;
        }

        const courseResult = await addCourseToUser({
          language: selectedLanguage,
          level: selectedLevel,
        });

        if (courseResult?.error && !courseResult.error.includes("already")) {
          setError(courseResult.error);
          return;
        }

        clearGuestData();
        router.push("/dashboard");
        router.refresh();
      } catch {
        setError(t("sthWentWrong"));
      }
    });
  };

  const handleGuestComplete = () => {
    if (!language || !level) return;

    setGuestInterests(interests);
    setGuestLanguage(language);
    setGuestLevel(level);

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

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || t("failedGenerate"));
          return;
        }

        const data = await res.json();

        const guestText: GuestText = {
          id: crypto.randomUUID(),
          title: data.title,
          content: data.text,
          translations: data.translations || [],
          createdAt: new Date().toISOString(),
          topic,
        };

        addGuestText(guestText);
        setOnboardingComplete(true);

        router.push(`/guest/reading/${guestText.id}`);
      } catch {
        setError(t("sthWentWrong"));
      }
    });
  };

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
              {isAuthenticated ? (
                <span className='text-muted-foreground text-sm'>
                  {userName ? t("hi", { name: userName }) : t("settingUp")}
                </span>
              ) : (
                <>
                  <span className='text-muted-foreground hidden text-sm sm:inline'>
                    {t("alreadyHaveAccount")}
                  </span>
                  <Button variant='outline' size='sm' asChild>
                    <Link href='/auth/login'>{t("signIn")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 pt-6'>
        <div className='mx-auto max-w-2xl'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm font-medium'>
              {t("stepOf", { step, total: totalSteps })}
            </span>
            <span className='text-muted-foreground text-sm'>
              {step === 1
                ? t("chooseInterestsLabel")
                : t("selectLanguageLabel")}
            </span>
          </div>
          <div className='bg-muted h-2 overflow-hidden rounded-full'>
            <div
              className='bg-primary h-full rounded-full transition-all duration-500 ease-out'
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        {step === 1 && (
          <div className='mx-auto max-w-3xl'>
            <div className='mb-8 text-center'>
              <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Sparkles className='text-primary h-8 w-8' />
              </div>
              <h1 className='mb-3 text-3xl font-bold sm:text-4xl'>
                {t("whatInterested")}
              </h1>
              <p className='text-muted-foreground text-lg'>
                {t("interestsDescription")}
              </p>
            </div>

            <FloatingInterests selected={interests} onChange={setInterests} />

            <div className='mt-8 flex justify-center'>
              <Button
                size='lg'
                onClick={handleStep1Next}
                disabled={!canProceedStep1 || isPending}
                className='gap-2 px-8'
              >
                {isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    {t("saving")}
                  </>
                ) : totalSteps === 1 ? (
                  <>
                    <Sparkles className='h-4 w-4' />
                    {t("startLearning")}
                  </>
                ) : (
                  <>
                    {t("continue")}
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </Button>
            </div>

            {!canProceedStep1 && (
              <p className='text-muted-foreground mt-3 text-center text-sm'>
                {t("selectAtLeastOne")}
              </p>
            )}

            {error && step === 1 && (
              <div className='mx-auto mt-4 max-w-md rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
                {error}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className='mx-auto max-w-xl'>
            <div className='mb-8 text-center'>
              <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Globe className='text-primary h-8 w-8' />
              </div>
              <h1 className='mb-3 text-3xl font-bold sm:text-4xl'>
                {t("chooseLanguage")}
              </h1>
              <p className='text-muted-foreground text-lg'>
                {t("languageDescription")}
              </p>
            </div>

            <div className='bg-card mx-auto max-w-md space-y-6 rounded-xl border p-6 shadow-sm'>
              <div className='space-y-2'>
                <Label className='flex items-center gap-2 text-base font-medium'>
                  <Globe className='text-primary h-4 w-4' />
                  {t("language")}
                </Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={t("languagePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id.toString()}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label className='flex items-center gap-2 text-base font-medium'>
                  <GraduationCap className='text-primary h-4 w-4' />
                  {t("level")}
                </Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={t("levelPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl.id.toString()}>
                        {t(`levels.${lvl.name}` as Parameters<typeof t>[0]) ||
                          lvl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {interests.length > 0 && (
                <div className='space-y-2'>
                  <Label className='text-muted-foreground text-sm'>
                    {t("yourInterests")}
                  </Label>
                  <div className='flex flex-wrap gap-1.5'>
                    {interests.slice(0, 6).map((interest) => (
                      <span
                        key={interest}
                        className='bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium'
                      >
                        {interest}
                      </span>
                    ))}
                    {interests.length > 6 && (
                      <span className='text-muted-foreground rounded-full px-2.5 py-0.5 text-xs'>
                        {t("more", { count: interests.length - 6 })}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'>
                  {error}
                </div>
              )}
            </div>

            <div className='mt-8 flex justify-center gap-3'>
              <Button
                size='lg'
                variant='outline'
                onClick={() => setStep(1)}
                className='gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                {t("back")}
              </Button>
              <Button
                size='lg'
                onClick={handleComplete}
                disabled={!canProceedStep2 || isPending}
                className='gap-2 px-8'
              >
                {isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    {isAuthenticated
                      ? t("settingUpAccount")
                      : t("generatingFirst")}
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4' />
                    {isAuthenticated ? t("startLearning") : t("generateFirst")}
                  </>
                )}
              </Button>
            </div>

            {!isAuthenticated && getGuestTextCount() > 0 && (
              <p className='text-muted-foreground mt-4 text-center text-sm'>
                {t("alreadyHaveTexts", { count: getGuestTextCount() })}{" "}
                <Link
                  href='/guest/reading'
                  className='text-primary hover:underline'
                >
                  {t("viewTexts")}
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
