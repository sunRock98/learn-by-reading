"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DictionaryStats } from "@/components/dictionary-stats";
import { DictionaryGrid } from "@/components/dictionary-grid";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LanguageGroup, LanguageStats } from "@/actions/dictionary";
import { MasteryLevel } from "@prisma/client";

interface DictionaryTabsProps {
  groups: LanguageGroup[];
  activeLanguageId: number | null;
}

export function DictionaryTabs({
  groups,
  activeLanguageId,
}: DictionaryTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Dictionary");

  // Determine initial tab from URL or active language
  const langParam = searchParams.get("lang");
  const initialTab = langParam
    ? langParam
    : activeLanguageId
      ? String(activeLanguageId)
      : "all";

  const [selectedTab, setSelectedTab] = useState(initialTab);

  // Compute "all languages" stats and words
  const allWords = useMemo(() => {
    return groups.flatMap((g) => g.words);
  }, [groups]);

  const allStats = useMemo((): LanguageStats => {
    return {
      total: allWords.length,
      learning: allWords.filter((w) => w.masteryLevel === MasteryLevel.LEARNING)
        .length,
      reviewing: allWords.filter(
        (w) => w.masteryLevel === MasteryLevel.REVIEWING
      ).length,
      mastered: allWords.filter((w) => w.masteryLevel === MasteryLevel.MASTERED)
        .length,
    };
  }, [allWords]);

  // Handle tab change - update URL for deep linking
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("lang");
    } else {
      params.set("lang", value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // If no groups (no words at all), show empty state
  if (groups.length === 0) {
    return (
      <>
        <DictionaryStats words={[]} />
        <DictionaryGrid words={[]} />
      </>
    );
  }

  // If only one language, no need for tabs
  if (groups.length === 1) {
    const group = groups[0];
    return (
      <>
        <div className='mb-4 flex items-center gap-2'>
          <Globe className='text-muted-foreground h-5 w-5' />
          <span className='text-lg font-medium'>{group.languageName}</span>
        </div>
        <DictionaryStats words={group.words} />
        <DictionaryGrid words={group.words} />
      </>
    );
  }

  return (
    <Tabs
      value={selectedTab}
      onValueChange={handleTabChange}
      className='w-full'
    >
      <TabsList className='mb-6 flex w-full flex-wrap gap-1'>
        {groups.map((group) => (
          <TabsTrigger
            key={group.languageId}
            value={String(group.languageId)}
            className='flex items-center gap-2'
          >
            <span>{group.languageName}</span>
            <span className='bg-muted-foreground/20 rounded-full px-2 py-0.5 text-xs'>
              {group.stats.total}
            </span>
          </TabsTrigger>
        ))}
        <TabsTrigger value='all' className='flex items-center gap-2'>
          <Globe className='h-4 w-4' />
          <span>{t("allLanguages")}</span>
          <span className='bg-muted-foreground/20 rounded-full px-2 py-0.5 text-xs'>
            {allStats.total}
          </span>
        </TabsTrigger>
      </TabsList>

      {/* Content for each language tab */}
      {groups.map((group) => (
        <TabsContent key={group.languageId} value={String(group.languageId)}>
          <DictionaryStats words={group.words} />
          <DictionaryGrid words={group.words} />
        </TabsContent>
      ))}

      {/* Content for "All Languages" tab */}
      <TabsContent value='all'>
        <DictionaryStats words={allWords} />
        <DictionaryGrid words={allWords} />
      </TabsContent>
    </Tabs>
  );
}
