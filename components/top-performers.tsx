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

const roleColors: Record<string, string> = {
  batter: "bg-primary/10 text-primary border-primary/20",
  bowler: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  allrounder: "bg-accent/10 text-accent border-accent/20",
  keeper: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border/40 bg-gradient-to-r from-muted/50 to-transparent px-6 py-4">
        <h3 className="font-bold text-foreground">Top Performers</h3>
      </div>
      <div className="p-4 space-y-3">
        {performers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/50 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">No data available</p>
        ) : (
          performers.map((performer, index) => (
            <div key={performer.id}
              className="flex items-center gap-4 rounded-xl border border-border/40 bg-muted/20 p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-sm font-bold text-primary shadow-sm ring-1 ring-primary/20">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground truncate">{performer.name}</p>
                  <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleColors[performer.role] || "bg-muted text-muted-foreground border-border/50"}`}>
                    {performer.role}
                  </span>
                </div>
                <div className="flex gap-4 mt-1.5 text-xs">
                  {performer.avg_batting != null && (
                    <span className="text-muted-foreground">Avg: <span className="font-bold text-foreground">{Number(performer.avg_batting).toFixed(1)}</span></span>
                  )}
                  {performer.avg_strike_rate != null && (
                    <span className="text-muted-foreground">SR: <span className="font-bold text-foreground">{Number(performer.avg_strike_rate).toFixed(1)}</span></span>
                  )}
                  {performer.total_wickets != null && (
                    <span className="text-muted-foreground">Wkts: <span className="font-bold text-foreground">{performer.total_wickets}</span></span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
