import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserDictionaryWords } from "@/actions/dictionary";
import { DictionaryGrid } from "@/components/dictionary-grid";
import { DictionaryStats } from "@/components/dictionary-stats";

export default async function DictionaryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { words } = await getUserDictionaryWords();

  return (
    <div className='container mx-auto max-w-6xl px-4 py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold'>My Dictionary</h1>
        <p className='text-muted-foreground text-lg'>
          All the words you&apos;ve learned across all courses
        </p>
      </div>

      <DictionaryStats words={words} />
      <DictionaryGrid words={words} />
    </div>
  );
}
