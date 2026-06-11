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

const focusColors: Record<string, string> = {
  batting: "bg-primary/10 text-primary border-primary/20",
  bowling: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  fielding: "bg-accent/10 text-accent border-accent/20",
  fitness: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  default: "bg-muted text-muted-foreground border-border/50",
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border/40 bg-gradient-to-r from-muted/50 to-transparent px-6 py-4">
        <h3 className="font-bold text-foreground">Recent Sessions</h3>
      </div>
      <div className="p-4 space-y-3">
        {sessions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/50 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">No recent sessions</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id}
              className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm">
              <div className="space-y-1">
                <p className="font-semibold text-sm text-foreground capitalize">
                  {session.focus} &mdash; <span className="text-muted-foreground font-normal">{session.age_group}</span>
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {new Date(session.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  &nbsp;&middot; {session.duration_minutes}min &middot; {session.num_players} players
                </p>
              </div>
              <Badge variant="outline" className={focusColors[session.focus] || focusColors.default}>
                {session.focus}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
