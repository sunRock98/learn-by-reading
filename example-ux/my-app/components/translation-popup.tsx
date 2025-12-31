"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, BookmarkPlus, Volume2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TranslationPopupProps {
  word: string
  language: string
  position: { x: number; y: number }
  onClose: () => void
}

// Mock translation data - in production, this would call an AI API
const mockTranslations: Record<string, any> = {
  gato: {
    translation: "cat",
    partOfSpeech: "noun",
    gender: "masculine",
    examples: ["El gato duerme. (The cat sleeps.)"],
    pronunciation: "GAH-toh",
  },
  ratón: {
    translation: "mouse",
    partOfSpeech: "noun",
    gender: "masculine",
    examples: ["El ratón es pequeño. (The mouse is small.)"],
    pronunciation: "rah-TOHN",
  },
  casa: {
    translation: "house",
    partOfSpeech: "noun",
    gender: "feminine",
    examples: ["La casa es grande. (The house is big.)"],
    pronunciation: "KAH-sah",
  },
  inteligente: {
    translation: "intelligent, smart",
    partOfSpeech: "adjective",
    examples: ["Ella es muy inteligente. (She is very intelligent.)"],
    pronunciation: "een-teh-lee-HEN-teh",
  },
  queso: {
    translation: "cheese",
    partOfSpeech: "noun",
    gender: "masculine",
    examples: ["Me gusta el queso. (I like cheese.)"],
    pronunciation: "KEH-soh",
  },
  technologies: {
    translation: "technologies",
    partOfSpeech: "noun",
    gender: "feminine plural",
    examples: ["Les technologies modernes (Modern technologies)"],
    pronunciation: "tek-noh-loh-ZHEE",
  },
  vie: {
    translation: "life",
    partOfSpeech: "noun",
    gender: "feminine",
    examples: ["La vie est belle. (Life is beautiful.)"],
    pronunciation: "vee",
  },
}

export function TranslationPopup({ word, language, position, onClose }: TranslationPopupProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [translation, setTranslation] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      const mockData = mockTranslations[word] || {
        translation: "translation not available",
        partOfSpeech: "unknown",
        examples: [],
      }
      setTranslation(mockData)
      setIsLoading(false)
    }, 500)
  }, [word])

  const handleSaveToDictionary = () => {
    setIsSaved(true)
    // In production, this would save to the user's dictionary
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const handlePlayAudio = () => {
    // In production, this would play text-to-speech audio
    console.log("[v0] Playing audio for:", word)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <Card
        className="fixed z-50 w-80 p-4 shadow-xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y - 10}px`,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{word}</h3>
            {translation?.pronunciation && <p className="text-sm text-muted-foreground">{translation.pronunciation}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{translation.partOfSpeech}</Badge>
                {translation.gender && <Badge variant="secondary">{translation.gender}</Badge>}
              </div>
              <p className="text-lg font-semibold">{translation.translation}</p>
            </div>

            {translation.examples && translation.examples.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Example:</p>
                <p className="text-sm text-muted-foreground italic">{translation.examples[0]}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handlePlayAudio} className="flex-1 bg-transparent">
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
              <Button
                variant={isSaved ? "secondary" : "default"}
                size="sm"
                onClick={handleSaveToDictionary}
                disabled={isSaved}
                className="flex-1"
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                {isSaved ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
