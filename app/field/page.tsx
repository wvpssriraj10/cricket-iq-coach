import { AppShell } from "@/components/app-shell";
import { FieldPlacementContent } from "@/components/field-placement-content";

export default function FieldPlacementPage() {
  return (
    <AppShell
      title="Field Placement Tutor"
      subtitle="Learn and practice cricket field placements"
    >
      <FieldPlacementContent />
    </AppShell>
  );
}
