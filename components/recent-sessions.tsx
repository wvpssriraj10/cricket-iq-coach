import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar } from "lucide-react";

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
  batting: "bg-primary/20 text-primary border-primary/30",
  bowling: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  fielding: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  fitness: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  default: "bg-muted/50 text-muted-foreground border-muted",
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
<<<<<<< HEAD
    <Card className="rounded-xl border-border/80 bg-card shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Recent Sessions</CardTitle>
=======
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
>>>>>>> origin/website-enhancement
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {sessions.length === 0 ? (
<<<<<<< HEAD
            <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">No recent sessions</p>
=======
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No recent sessions</p>
            </div>
>>>>>>> origin/website-enhancement
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
<<<<<<< HEAD
                className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:bg-muted/30 hover:shadow"
=======
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4 transition-all duration-300 hover:bg-muted/40 hover:border-border"
>>>>>>> origin/website-enhancement
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold capitalize text-foreground">
                        {session.focus} Session
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${focusAreaColors[session.focus] || focusAreaColors.default}`}
                      >
                        {session.age_group}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(session.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {session.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {session.num_players} players
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold ${focusAreaColors[session.focus] || focusAreaColors.default}`}
                  >
                    {session.focus}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
