import { db } from "@/lib/db";

/**
 * Onboarding is reserved for a signed-in learner who has not saved any
 * preferences and has not joined a course yet. Having either is enough to
 * make the dashboard the learner's home.
 */
export async function needsOnboarding(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      interests: true,
      subscriptions: { select: { id: true }, take: 1 },
    },
  });

  return (
    !user || (user.interests.length === 0 && user.subscriptions.length === 0)
  );
}

export async function getOnboardingUserData(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      interests: true,
      subscriptions: { select: { id: true }, take: 1 },
    },
  });
}
