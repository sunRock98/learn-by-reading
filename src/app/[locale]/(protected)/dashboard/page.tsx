import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { CourseGrid } from "@/components/dashboard/course-grid";
import { RecentWords } from "@/components/dashboard/recent-words";
import { getTranslations } from "next-intl/server";

async function getLanguagesAndLevels() {
  const [languages, levels] = await Promise.all([
    db.language.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),
    db.level.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return { languages, levels };
}

async function getDashboardData(userId: string) {
  // Get user's courses with progress
  const courses = await db.course.findMany({
    where: {
      subscribers: {
        some: { id: userId },
      },
    },
    include: {
      language: true,
      level: true,
      texts: {
        include: {
          progress: {
            where: { userId },
          },
        },
      },
    },
  });

  // Get dictionary statistics
  const words = await db.word.findMany({
    where: {
      dictionary: {
        userId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      languageFrom: true,
      languageTo: true,
    },
  });

  const wordStats = await db.word.groupBy({
    by: ["masteryLevel"],
    where: {
      dictionary: {
        userId,
      },
    },
    _count: true,
  });

  const totalWords = wordStats.reduce((sum, stat) => sum + stat._count, 0);
  const masteredWords =
    wordStats.find((s) => s.masteryLevel === "MASTERED")?._count || 0;

  return {
    courses,
    recentWords: words,
    stats: {
      totalWords,
      masteredWords,
      coursesCount: courses.length,
    },
  };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const t = await getTranslations("Dashboard");

  if (!user) {
    redirect("/auth/login");
  }

  const [{ courses, recentWords, stats }, { languages, levels }] =
    await Promise.all([getDashboardData(user.id!), getLanguagesAndLevels()]);

  return (
    <div className='container mx-auto max-w-6xl px-4 py-4 sm:py-6 lg:py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-balance text-4xl font-bold'>
          {t("welcomeBack")}
          {user.name ? `, ${user.name}` : ""}!
        </h1>
        <p className='text-muted-foreground text-lg'>{t("subtitle")}</p>
      </div>

      <StatsOverview stats={stats} />

      <div className='grid gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <CourseGrid courses={courses} languages={languages} levels={levels} />
        </div>
        <div>
          <RecentWords words={recentWords} />
        </div>
      </div>
    </div>
  );
}
