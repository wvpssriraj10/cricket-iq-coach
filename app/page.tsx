import { AppShell } from "@/components/app-shell";
import { DashboardContent } from "@/components/dashboard-content";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Team performance overview">
      <DashboardContent />
    </AppShell>
  );
}
