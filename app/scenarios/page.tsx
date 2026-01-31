import { AppShell } from "@/components/app-shell";
import { MatchScenarioContent } from "@/components/match-scenario-content";

export default function MatchScenariosPage() {
  return (
    <AppShell
      title="Match Scenarios"
      subtitle="Simulate game situations and analyze strategies"
    >
      <MatchScenarioContent />
    </AppShell>
  );
}
