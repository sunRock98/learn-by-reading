import { CourseGrid } from "@/components/course-grid";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatsOverview } from "@/components/stats-overview";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className='bg-background min-h-screen'>
      <DashboardHeader />
      <main className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-2 text-balance text-4xl font-bold'>
            Learn by Reading
          </h1>
          <p className='text-muted-foreground text-lg'>
            Master languages through authentic reading experiences
          </p>
        </div>

        <StatsOverview />
        <CourseGrid />
      </main>
    </div>
  );
}
