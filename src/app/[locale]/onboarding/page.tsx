import { db } from "@/lib/db";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getCurrentUser } from "@/lib/auth";
import { getOnboardingUserData, needsOnboarding } from "@/lib/onboarding";
import { redirect } from "next/navigation";
import { GuestDataSync } from "@/components/onboarding/guest-data-sync";

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
    if (!(await needsOnboarding(user.id))) {
      redirect("/dashboard");
    }

    isAuthenticated = true;
    const userData = await getOnboardingUserData(user.id);
    userName = userData?.name ?? user.name ?? null;
    userInterests = userData?.interests ?? [];
    userHasCourses = (userData?.subscriptions.length ?? 0) > 0;
  }

  return (
    <>
      {isAuthenticated && <GuestDataSync />}
      <OnboardingFlow
        languages={languages}
        levels={levels}
        isAuthenticated={isAuthenticated}
        userName={userName}
        userInterests={userInterests}
        userHasCourses={userHasCourses}
      />
    </>
  );
}
