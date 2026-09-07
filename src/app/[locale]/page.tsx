import { LandingPage } from "@/components/landing-page";
import { getCurrentUser } from "@/lib/auth";
import { needsOnboarding } from "@/lib/onboarding";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (user?.id) {
    redirect((await needsOnboarding(user.id)) ? "/onboarding" : "/dashboard");
  }

  return <LandingPage />;
}
