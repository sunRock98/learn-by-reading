import { Header } from "@/components/header";
import { ProfileHeader } from "@/components/profile-header";
import { ProgressCharts } from "@/components/progress-charts";
import { ActivityFeed } from "@/components/activity-feed";
import { LearningGoals } from "@/components/learning-goals";

export default function ProfilePage() {
  return (
    <div className='bg-background min-h-screen'>
      <Header />
      <main className='container mx-auto px-4 py-8'>
        <ProfileHeader />
        <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <ProgressCharts />
          </div>
          <div>
            <LearningGoals />
          </div>
        </div>
        <ActivityFeed />
      </main>
    </div>
  );
}
