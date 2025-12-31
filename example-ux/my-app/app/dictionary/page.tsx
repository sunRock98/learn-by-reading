import { Header } from "@/components/header"
import { DictionaryGrid } from "@/components/dictionary-grid"
import { DictionaryStats } from "@/components/dictionary-stats"
import { DictionaryFilters } from "@/components/dictionary-filters"

export default function DictionaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Dictionary</h1>
          <p className="text-muted-foreground text-lg">Your personal collection of learned words</p>
        </div>

        <DictionaryStats />
        <DictionaryFilters />
        <DictionaryGrid />
      </main>
    </div>
  )
}
