"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TranslationPopup } from "@/components/translation-popup"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Text {
  id: string
  title: string
  content: string
  language: string
  level: string
  courseId: string
}

interface InteractiveReaderProps {
  text: Text
}

interface WordPosition {
  word: string
  x: number
  y: number
}

export function InteractiveReader({ text }: InteractiveReaderProps) {
  const [selectedWord, setSelectedWord] = useState<WordPosition | null>(null)
  const [completedReading, setCompletedReading] = useState(false)
  const router = useRouter()

  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget
    const word = target.textContent || ""
    const rect = target.getBoundingClientRect()

    setSelectedWord({
      word: word.toLowerCase().replace(/[.,!?;:]/g, ""),
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
  }

  const handleClosePopup = () => {
    setSelectedWord(null)
  }

  const handleCompleteReading = () => {
    setCompletedReading(true)
    setTimeout(() => {
      router.push(`/course/${text.courseId}`)
    }, 2000)
  }

  const renderInteractiveText = (content: string) => {
    const words = content.split(/(\s+)/)

    return words.map((word, index) => {
      if (word.trim() === "") {
        return <span key={index}>{word}</span>
      }

      return (
        <span
          key={index}
          onClick={handleWordClick}
          className="cursor-pointer hover:bg-accent/30 hover:text-accent-foreground rounded px-0.5 transition-colors"
        >
          {word}
        </span>
      )
    })
  }

  return (
    <div>
      <Card className="p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-balance">{text.title}</h1>
            <Badge variant="secondary">{text.level}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Click on any word to see its translation and add it to your dictionary
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="text-lg leading-relaxed whitespace-pre-line">{renderInteractiveText(text.content)}</div>
        </div>
      </Card>

      {!completedReading ? (
        <div className="flex justify-center">
          <Button onClick={handleCompleteReading} size="lg" className="gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Mark as Complete
          </Button>
        </div>
      ) : (
        <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
            <CheckCircle2 className="h-6 w-6" />
            <div>
              <p className="font-semibold">Great job!</p>
              <p className="text-sm">Returning to course...</p>
            </div>
          </div>
        </Card>
      )}

      {selectedWord && (
        <TranslationPopup
          word={selectedWord.word}
          language={text.language}
          position={{ x: selectedWord.x, y: selectedWord.y }}
          onClose={handleClosePopup}
        />
      )}
    </div>
  )
}
