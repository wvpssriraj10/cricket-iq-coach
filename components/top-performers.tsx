import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Zap, Target } from "lucide-react";

interface Performer {
  id: string | number;
  name: string;
  role: string;
  avg_batting: number | null;
  avg_strike_rate: number | null;
  total_wickets: number | null;
}

interface TopPerformersProps {
  performers: Performer[];
}

const rankColors = [
  "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-500",
  "from-slate-400/20 to-slate-400/5 border-slate-400/30 text-slate-400",
  "from-orange-600/20 to-orange-600/5 border-orange-600/30 text-orange-600",
];

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
<<<<<<< HEAD
    <Card className="rounded-xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Top Performers</CardTitle>
=======
    <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">Top Performers</CardTitle>
        </div>
>>>>>>> origin/website-enhancement
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {performers.length === 0 ? (
<<<<<<< HEAD
            <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">No data available</p>
=======
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
>>>>>>> origin/website-enhancement
          ) : (
            performers.map((performer, index) => (
              <div
                key={performer.id}
<<<<<<< HEAD
                className="flex items-center gap-4 rounded-xl border border-border/80 p-4 transition-all hover:bg-muted/20"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20 text-sm font-bold text-primary shadow-inner">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{performer.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {performer.role}
                    </Badge>
=======
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4 transition-all duration-300 hover:bg-muted/40 hover:border-border"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border ${rankColors[index] || "from-muted to-muted/50 border-border text-muted-foreground"}`}>
                    <span className="text-sm font-bold">#{index + 1}</span>
>>>>>>> origin/website-enhancement
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{performer.name}</p>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] uppercase tracking-wider border-border/50 bg-muted/30"
                      >
                        {performer.role}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      {performer.avg_batting ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          Avg: <span className="font-semibold text-foreground">{Number(performer.avg_batting).toFixed(1)}</span>
                        </span>
                      ) : null}
                      {performer.avg_strike_rate ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Zap className="h-3 w-3 text-chart-3" />
                          SR: <span className="font-semibold text-foreground">{Number(performer.avg_strike_rate).toFixed(1)}</span>
                        </span>
                      ) : null}
                      {performer.total_wickets ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Target className="h-3 w-3 text-chart-2" />
                          Wkts: <span className="font-semibold text-foreground">{performer.total_wickets}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
