import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
    <Card className="rounded-xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">No data available</p>
          ) : (
            performers.map((performer, index) => (
              <div
                key={performer.id}
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
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {performer.avg_batting && (
                      <span>
                        Avg:{" "}
                        <span className="font-medium text-foreground">
                          {Number(performer.avg_batting).toFixed(1)}
                        </span>
                      </span>
                    )}
                    {performer.avg_strike_rate && (
                      <span>
                        SR:{" "}
                        <span className="font-medium text-foreground">
                          {Number(performer.avg_strike_rate).toFixed(1)}
                        </span>
                      </span>
                    )}
                    {performer.total_wickets && (
                      <span>
                        Wickets:{" "}
                        <span className="font-medium text-foreground">
                          {performer.total_wickets}
                        </span>
                      </span>
                    )}
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
