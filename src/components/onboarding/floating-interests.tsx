"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Plus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const SIZES = ["sm", "md", "lg"] as const;
type BubbleSize = (typeof SIZES)[number];

interface BubbleWord {
  text: string;
  size: BubbleSize;
  angle: number;
  radius: number;
  animDelay: number;
  animDuration: number;
}

function generateBubbleLayout(words: string[]): BubbleWord[] {
  const golden = 137.508;
  return words.map((text, i) => {
    const sizeIndex = i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
    const angle = i * golden;
    const radius = 18 + Math.sqrt(i) * 11;
    const animDelay = (i * 0.15) % 4;
    const animDuration = 4 + (i % 3) * 1.5;
    return {
      text,
      size: SIZES[sizeIndex],
      angle,
      radius: Math.min(radius, 42),
      animDelay,
      animDuration,
    };
  });
}

const sizeClasses: Record<BubbleSize, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5 font-medium",
};

interface FloatingInterestsProps {
  selected: string[];
  onChange: (interests: string[]) => void;
}

export function FloatingInterests({
  selected,
  onChange,
}: FloatingInterestsProps) {
  const tInterests = useTranslations("Interests");
  const tUI = useTranslations("FloatingInterests");

  const defaultInterests = useMemo(
    () => INTEREST_KEYS.map((key) => tInterests(key)),
    [tInterests]
  );

  const [customInput, setCustomInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [allWords, setAllWords] = useState<string[]>(defaultInterests);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const toggleInterest = useCallback(
    (interest: string) => {
      if (selected.includes(interest)) {
        onChange(selected.filter((i) => i !== interest));
      } else {
        onChange([...selected, interest]);
      }
    },
    [selected, onChange]
  );

  const addCustomInterest = useCallback(() => {
    const trimmed = customInput.trim();
    if (
      trimmed &&
      !allWords.some((w) => w.toLowerCase() === trimmed.toLowerCase())
    ) {
      setAllWords((prev) => [...prev, trimmed]);
      onChange([...selected, trimmed]);
      setCustomInput("");
    } else if (
      trimmed &&
      allWords.some((w) => w.toLowerCase() === trimmed.toLowerCase())
    ) {
      const existing = allWords.find(
        (w) => w.toLowerCase() === trimmed.toLowerCase()
      )!;
      if (!selected.includes(existing)) {
        onChange([...selected, existing]);
      }
      setCustomInput("");
    }
  }, [customInput, allWords, selected, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomInterest();
    }
    if (e.key === "Escape") {
      setShowInput(false);
      setCustomInput("");
    }
  };

  const bubbles = generateBubbleLayout(allWords);

  return (
    <div className='flex flex-col items-center gap-6'>
      <div className='relative mx-auto h-[420px] w-full max-w-[600px] sm:h-[480px]'>
        <div className='absolute inset-0 flex items-center justify-center'>
          {bubbles.map((bubble, i) => {
            const isSelected = selected.includes(bubble.text);
            const rad = (bubble.angle * Math.PI) / 180;
            const x = Math.cos(rad) * bubble.radius;
            const y = Math.sin(rad) * bubble.radius;

            return (
              <button
                key={bubble.text}
                onClick={() => toggleInterest(bubble.text)}
                className={`absolute cursor-pointer select-none rounded-full border-2 transition-all duration-300 ${sizeClasses[bubble.size]} ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-primary/25 z-10 scale-110 shadow-lg"
                    : "bg-card text-foreground hover:border-primary/50 hover:bg-primary/5 border-border hover:scale-105"
                } ${mounted ? "opacity-100" : "scale-0 opacity-0"} `}
                style={{
                  left: `calc(50% + ${x}%)`,
                  top: `calc(50% + ${y}%)`,
                  transform: `translate(-50%, -50%) ${isSelected ? "scale(1.1)" : "scale(1)"}`,
                  animation: mounted
                    ? `floatBubble ${bubble.animDuration}s ease-in-out ${bubble.animDelay}s infinite`
                    : "none",
                  transitionDelay: `${i * 30}ms`,
                }}
              >
                <span className='flex items-center gap-1.5'>
                  {isSelected && <Check className='h-3 w-3' />}
                  {bubble.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className='flex w-full max-w-md flex-col items-center gap-3'>
        {selected.length > 0 && (
          <div className='flex flex-wrap justify-center gap-2'>
            {selected.map((interest) => (
              <span
                key={interest}
                className='bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium'
              >
                {interest}
                <button
                  onClick={() => toggleInterest(interest)}
                  className='hover:bg-primary/20 rounded-full p-0.5 transition-colors'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            ))}
          </div>
        )}

        {showInput ? (
          <div className='flex w-full max-w-xs gap-2'>
            <Input
              ref={inputRef}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tUI("typeInterest")}
              className='flex-1'
            />
            <Button
              size='sm'
              onClick={addCustomInterest}
              disabled={!customInput.trim()}
            >
              <Plus className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => {
                setShowInput(false);
                setCustomInput("");
              }}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowInput(true)}
            className='gap-1.5'
          >
            <Plus className='h-4 w-4' />
            {tUI("addOwn")}
          </Button>
        )}
      </div>
    </div>
  );
}
