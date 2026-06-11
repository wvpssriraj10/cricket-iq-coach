import { AppShell } from "@/components/app-shell";
import { DashboardContent } from "@/components/dashboard-content";
import { getUserProfile } from "@/utils/auth";

export default async function DashboardPage() {
  const authData = await getUserProfile();
  
  return (
    <AppShell title="Dashboard" subtitle={authData?.profile?.role === 'player' ? "Your performance and sessions" : "Track your team performance in real-time"}>
      <DashboardContent profile={authData?.profile as any} />
    </AppShell>
  );
}
