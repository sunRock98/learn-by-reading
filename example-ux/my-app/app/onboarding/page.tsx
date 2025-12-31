"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Globe, Target, Sparkles } from "lucide-react"

const LANGUAGES = [
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "japanese", label: "Japanese" },
  { value: "chinese", label: "Chinese" },
  { value: "korean", label: "Korean" },
]

const LEVELS = [
  { value: "A1", label: "A1 - Beginner", description: "Just starting out" },
  { value: "A2", label: "A2 - Elementary", description: "Basic phrases and expressions" },
  { value: "B1", label: "B1 - Intermediate", description: "Can handle most situations" },
  { value: "B2", label: "B2 - Upper Intermediate", description: "Comfortable with complex topics" },
  { value: "C1", label: "C1 - Advanced", description: "Fluent and spontaneous" },
  { value: "C2", label: "C2 - Proficient", description: "Near-native level" },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState("")
  const [level, setLevel] = useState("")
  const [interests, setInterests] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleComplete = async () => {
    if (!language || !level) {
      setError("Please complete all required fields")
      return
    }

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const interestsArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0)

      const { error: prefError } = await supabase.from("user_preferences").insert({
        user_id: user.id,
        target_language: language,
        proficiency_level: level,
        interests: interestsArray,
        onboarding_completed: true,
      })

      if (prefError) throw prefError

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">Read2Learn</span>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-4">
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
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Choose Your Language</CardTitle>
                <CardDescription className="text-center">Which language would you like to learn?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={language} onValueChange={setLanguage}>
                  <div className="grid grid-cols-2 gap-4">
                    {LANGUAGES.map((lang) => (
                      <div key={lang.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={lang.value} id={lang.value} />
                        <Label htmlFor={lang.value} className="cursor-pointer">
                          {lang.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <Button className="w-full mt-6" onClick={() => setStep(2)} disabled={!language}>
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Select Your Level</CardTitle>
                <CardDescription className="text-center">What&apos;s your current proficiency level?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={level} onValueChange={setLevel}>
                  <div className="space-y-3">
                    {LEVELS.map((lvl) => (
                      <div
                        key={lvl.value}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => setLevel(lvl.value)}
                      >
                        <RadioGroupItem value={lvl.value} id={lvl.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={lvl.value} className="cursor-pointer font-medium">
                            {lvl.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{lvl.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!level} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Your Interests</CardTitle>
                <CardDescription className="text-center">Tell us what topics interest you (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="interests">Interests (comma-separated)</Label>
                    <Textarea
                      id="interests"
                      placeholder="e.g., travel, cooking, technology, sports, music"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      We&apos;ll use this to recommend relevant reading content
                    </p>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleComplete} disabled={isLoading} className="flex-1">
                    {isLoading ? "Setting up..." : "Complete Setup"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
