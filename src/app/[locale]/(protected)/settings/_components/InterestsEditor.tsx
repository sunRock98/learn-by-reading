"use client";

import { useState, useRef, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2, Check } from "lucide-react";
import { saveUserInterests } from "@/actions/save-user-interests";
import { useTranslations } from "next-intl";

const INTEREST_KEYS = [
  "travel",
  "foodCooking",
  "sports",
  "music",
  "moviesTv",
  "technology",
  "science",
  "history",
  "nature",
  "art",
  "fashion",
  "books",
  "gaming",
  "business",
  "healthFitness",
  "animals",
  "culture",
  "photography",
  "space",
  "psychology",
  "adventure",
  "romance",
  "mystery",
  "dailyLife",
  "family",
  "holidays",
  "cityLife",
  "countryside",
] as const;

interface InterestsEditorProps {
  initialInterests: string[];
}

export function InterestsEditor({ initialInterests }: InterestsEditorProps) {
  const t = useTranslations("InterestsEditor");
  const tInterests = useTranslations("Interests");

  const suggestedInterests = useMemo(
    () => INTEREST_KEYS.map((key) => tInterests(key)),
    [tInterests]
  );

  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [customInput, setCustomInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChanges =
    JSON.stringify(interests.sort()) !==
    JSON.stringify([...initialInterests].sort());

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
    setSaved(false);
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    if (!interests.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setInterests((prev) => [...prev, trimmed]);
      setSaved(false);
    }
    setCustomInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveUserInterests(interests);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const availableSuggestions = suggestedInterests.filter(
    (s) => !interests.includes(s)
  );

  return (
    <div className='space-y-4'>
      <Label className='text-base font-medium'>{t("title")}</Label>
      <p className='text-muted-foreground text-sm'>{t("description")}</p>

      {interests.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {interests.map((interest) => (
            <span
              key={interest}
              className='bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium'
            >
              {interest}
              <button
                onClick={() => toggleInterest(interest)}
                className='hover:bg-primary/20 rounded-full p-0.5 transition-colors'
                type='button'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm'>
          {t("noInterests")}
        </p>
      )}

      <div className='flex gap-2'>
        <Input
          ref={inputRef}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("addCustom")}
          className='flex-1'
        />
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={addCustom}
          disabled={!customInput.trim()}
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>

      {availableSuggestions.length > 0 && (
        <div className='space-y-2'>
          <Label className='text-muted-foreground text-xs'>
            {t("suggestedInterests")}
          </Label>
          <div className='flex flex-wrap gap-1.5'>
            {availableSuggestions.slice(0, 12).map((suggestion) => (
              <button
                key={suggestion}
                type='button'
                onClick={() => toggleInterest(suggestion)}
                className='text-muted-foreground hover:border-primary hover:text-primary rounded-full border border-dashed px-2.5 py-1 text-xs transition-colors'
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
      )}

      <div className='flex items-center gap-3'>
        <Button
          type='button'
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          size='sm'
        >
          {isPending ? (
            <>
              <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
              {t("saving")}
            </>
          ) : saved ? (
            <>
              <Check className='mr-1.5 h-3.5 w-3.5' />
              {t("saved")}
            </>
          ) : (
            t("saveInterests")
          )}
        </Button>
        {hasChanges && !saved && (
          <span className='text-muted-foreground text-xs'>
            {t("unsavedChanges")}
          </span>
        )}
      </div>
    </div>
  );
}
