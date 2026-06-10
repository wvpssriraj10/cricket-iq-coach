import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: string;
  date: string;
  focus: string;
  age_group: string;
  duration_minutes: number;
  num_players: number;
}

interface RecentSessionsProps {
  sessions: Session[];
}

const focusAreaColors: Record<string, string> = {
  batting: "bg-primary/10 text-primary",
  bowling: "bg-secondary/10 text-secondary",
  fielding: "bg-accent/10 text-accent-foreground",
  fitness: "bg-chart-4/20 text-foreground",
  default: "bg-muted text-muted-foreground",
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <Card className="rounded-xl border-border/80 bg-card shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">No recent sessions</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:bg-muted/30 hover:shadow"
              >
                <div className="space-y-1">
                  <p className="font-medium capitalize">
                    {session.focus} - {session.age_group}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    - {session.duration_minutes} min, {session.num_players} players
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={focusAreaColors[session.focus] || focusAreaColors.default}
                >
                  {session.focus}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
