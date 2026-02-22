import { db } from "@/lib/db";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentUser } from "@/lib/auth";

async function getLanguages() {
  return await db.language.findMany({
    select: { id: true, name: true, code: true },
  });
}

async function getLevels() {
  return await db.level.findMany({
    select: { id: true, name: true },
  });
}

async function getUserData(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      interests: true,
      subscriptions: { select: { id: true } },
    },
  });
}

export default async function OnboardingPage() {
  const [languages, levels, user] = await Promise.all([
    getLanguages(),
    getLevels(),
    getCurrentUser(),
  ]);

  let isAuthenticated = false;
  let userName: string | null = null;
  let userInterests: string[] = [];
  let userHasCourses = false;

  if (user?.id) {
    isAuthenticated = true;
    const userData = await getUserData(user.id);
    userName = userData?.name ?? user.name ?? null;
    userInterests = userData?.interests ?? [];
    userHasCourses = (userData?.subscriptions.length ?? 0) > 0;
  }

  return (
    <OnboardingFlow
      languages={languages}
      levels={levels}
      isAuthenticated={isAuthenticated}
      userName={userName}
      userInterests={userInterests}
      userHasCourses={userHasCourses}
    />
  );
}
