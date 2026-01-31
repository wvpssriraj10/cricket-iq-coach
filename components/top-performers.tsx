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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            performers.map((performer, index) => (
              <div
                key={performer.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
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
