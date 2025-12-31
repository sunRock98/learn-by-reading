import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
