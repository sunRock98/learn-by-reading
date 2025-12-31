"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Globe, Target, Sparkles } from "lucide-react";

const LANGUAGES = [
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "japanese", label: "Japanese" },
  { value: "chinese", label: "Chinese" },
  { value: "korean", label: "Korean" },
];

const LEVELS = [
  { value: "A1", label: "A1 - Beginner", description: "Just starting out" },
  {
    value: "A2",
    label: "A2 - Elementary",
    description: "Basic phrases and expressions",
  },
  {
    value: "B1",
    label: "B1 - Intermediate",
    description: "Can handle most situations",
  },
  {
    value: "B2",
    label: "B2 - Upper Intermediate",
    description: "Comfortable with complex topics",
  },
  {
    value: "C1",
    label: "C1 - Advanced",
    description: "Fluent and spontaneous",
  },
  { value: "C2", label: "C2 - Proficient", description: "Near-native level" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [interests, setInterests] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleComplete = async () => {
    if (!language || !level) {
      setError("Please complete all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const interestsArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const { error: prefError } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          target_language: language,
          proficiency_level: level,
          interests: interestsArray,
          onboarding_completed: true,
        });

      if (prefError) throw prefError;

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='from-background to-muted/20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b p-6 md:p-10'>
      <div className='w-full max-w-2xl'>
        <div className='flex flex-col gap-6'>
          <div className='mb-4 flex items-center justify-center gap-2'>
            <BookOpen className='text-primary h-8 w-8' />
            <span className='text-2xl font-bold'>Read2Learn</span>
          </div>

          {/* Progress Indicator */}
          <div className='mb-4 flex justify-center gap-2'>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <div className='mb-4 flex justify-center'>
                  <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full'>
                    <Globe className='text-primary h-8 w-8' />
                  </div>
                </div>
                <CardTitle className='text-center text-2xl'>
                  Choose Your Language
                </CardTitle>
                <CardDescription className='text-center'>
                  Which language would you like to learn?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={language} onValueChange={setLanguage}>
                  <div className='grid grid-cols-2 gap-4'>
                    {LANGUAGES.map((lang) => (
                      <div
                        key={lang.value}
                        className='flex items-center space-x-2'
                      >
                        <RadioGroupItem value={lang.value} id={lang.value} />
                        <Label htmlFor={lang.value} className='cursor-pointer'>
                          {lang.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <Button
                  className='mt-6 w-full'
                  onClick={() => setStep(2)}
                  disabled={!language}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <div className='mb-4 flex justify-center'>
                  <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full'>
                    <Target className='text-primary h-8 w-8' />
                  </div>
                </div>
                <CardTitle className='text-center text-2xl'>
                  Select Your Level
                </CardTitle>
                <CardDescription className='text-center'>
                  What&apos;s your current proficiency level?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={level} onValueChange={setLevel}>
                  <div className='space-y-3'>
                    {LEVELS.map((lvl) => (
                      <div
                        key={lvl.value}
                        className='hover:bg-muted/50 flex cursor-pointer items-start space-x-3 rounded-lg border p-3'
                        onClick={() => setLevel(lvl.value)}
                      >
                        <RadioGroupItem
                          value={lvl.value}
                          id={lvl.value}
                          className='mt-1'
                        />
                        <div className='flex-1'>
                          <Label
                            htmlFor={lvl.value}
                            className='cursor-pointer font-medium'
                          >
                            {lvl.label}
                          </Label>
                          <p className='text-muted-foreground text-sm'>
                            {lvl.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <div className='mt-6 flex gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => setStep(1)}
                    className='flex-1'
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!level}
                    className='flex-1'
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <div className='mb-4 flex justify-center'>
                  <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full'>
                    <Sparkles className='text-primary h-8 w-8' />
                  </div>
                </div>
                <CardTitle className='text-center text-2xl'>
                  Your Interests
                </CardTitle>
                <CardDescription className='text-center'>
                  Tell us what topics interest you (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='interests'>
                      Interests (comma-separated)
                    </Label>
                    <Textarea
                      id='interests'
                      placeholder='e.g., travel, cooking, technology, sports, music'
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      className='mt-2'
                      rows={4}
                    />
                    <p className='text-muted-foreground mt-2 text-xs'>
                      We&apos;ll use this to recommend relevant reading content
                    </p>
                  </div>
                  {error && <p className='text-destructive text-sm'>{error}</p>}
                </div>
                <div className='mt-6 flex gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => setStep(2)}
                    className='flex-1'
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className='flex-1'
                  >
                    {isLoading ? "Setting up..." : "Complete Setup"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
