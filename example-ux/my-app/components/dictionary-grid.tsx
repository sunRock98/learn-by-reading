"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Volume2, Trash2, Star } from "lucide-react"

const mockDictionaryWords = [
  {
    id: "1",
    word: "gato",
    translation: "cat",
    language: "Spanish",
    partOfSpeech: "noun",
    gender: "masculine",
    pronunciation: "GAH-toh",
    example: "El gato duerme. (The cat sleeps.)",
    addedDate: "2024-01-15",
    practiceCount: 12,
    mastered: true,
  },
  {
    id: "2",
    word: "inteligente",
    translation: "intelligent, smart",
    language: "Spanish",
    partOfSpeech: "adjective",
    pronunciation: "een-teh-lee-HEN-teh",
    example: "Ella es muy inteligente. (She is very intelligent.)",
    addedDate: "2024-01-14",
    practiceCount: 8,
    mastered: false,
  },
  {
    id: "3",
    word: "casa",
    translation: "house",
    language: "Spanish",
    partOfSpeech: "noun",
    gender: "feminine",
    pronunciation: "KAH-sah",
    example: "La casa es grande. (The house is big.)",
    addedDate: "2024-01-14",
    practiceCount: 15,
    mastered: true,
  },
  {
    id: "4",
    word: "vie",
    translation: "life",
    language: "French",
    partOfSpeech: "noun",
    gender: "feminine",
    pronunciation: "vee",
    example: "La vie est belle. (Life is beautiful.)",
    addedDate: "2024-01-13",
    practiceCount: 5,
    mastered: false,
  },
  {
    id: "5",
    word: "queso",
    translation: "cheese",
    language: "Spanish",
    partOfSpeech: "noun",
    gender: "masculine",
    pronunciation: "KEH-soh",
    example: "Me gusta el queso. (I like cheese.)",
    addedDate: "2024-01-12",
    practiceCount: 10,
    mastered: true,
  },
  {
    id: "6",
    word: "technologies",
    translation: "technologies",
    language: "French",
    partOfSpeech: "noun",
    gender: "feminine plural",
    pronunciation: "tek-noh-loh-ZHEE",
    example: "Les technologies modernes (Modern technologies)",
    addedDate: "2024-01-11",
    practiceCount: 3,
    mastered: false,
  },
]

export function DictionaryGrid() {
  const [words, setWords] = useState(mockDictionaryWords)

  const handlePlayAudio = (word: string) => {
    console.log("[v0] Playing audio for:", word)
  }

  const handleToggleMastered = (id: string) => {
    setWords(words.map((w) => (w.id === id ? { ...w, mastered: !w.mastered } : w)))
  }

  const handleDelete = (id: string) => {
    setWords(words.filter((w) => w.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{words.length} words in your dictionary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {words.map((word) => (
          <Card key={word.id} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{word.word}</h3>
                  {word.mastered && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{word.pronunciation}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleToggleMastered(word.id)}>
                <Star className={`h-4 w-4 ${word.mastered ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{word.partOfSpeech}</Badge>
                {word.gender && <Badge variant="secondary">{word.gender}</Badge>}
                <Badge variant="secondary">{word.language}</Badge>
              </div>

              <p className="text-lg font-semibold">{word.translation}</p>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm italic text-muted-foreground">{word.example}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Practiced {word.practiceCount} times</span>
                <span>Added {new Date(word.addedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePlayAudio(word.word)} className="flex-1">
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(word.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
