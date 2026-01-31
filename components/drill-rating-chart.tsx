"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DrillRatingChartProps {
  data: Array<{ session_date: string; avg_rating: number | null }>;
}

export function DrillRatingChart({ data }: DrillRatingChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.session_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    rating: d.avg_rating != null ? Number(d.avg_rating) : null,
  }));

  return (
    <Card className="rounded-xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">
          Avg Drill Rating per Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {chartData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No drill ratings yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  domain={[1, 5]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [value != null ? value.toFixed(1) : "—", "Avg rating (1–5)"]}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  name="Avg rating"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-1)", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
