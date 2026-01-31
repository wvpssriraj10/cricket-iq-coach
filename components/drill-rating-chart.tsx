"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Star } from "lucide-react";

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
<<<<<<< HEAD
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
=======
    <div className="h-80 p-6">
      {chartData.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/30 mb-3">
            <Star className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">No drill ratings yet</p>
>>>>>>> origin/website-enhancement
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 260)" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "oklch(0.65 0.02 260)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.22 0.02 260)" }}
            />
            <YAxis
              domain={[1, 5]}
              tick={{ fontSize: 11, fill: "oklch(0.65 0.02 260)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.22 0.02 260)" }}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.13 0.015 260)",
                border: "1px solid oklch(0.22 0.02 260)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
              labelStyle={{ color: "oklch(0.98 0.005 260)", fontWeight: 600 }}
              formatter={(value: number) => [value != null ? value.toFixed(1) : "--", "Avg Rating (1-5)"]}
            />
            <Area
              type="monotone"
              dataKey="rating"
              name="Avg Rating"
              stroke="oklch(0.65 0.2 145)"
              strokeWidth={3}
              fill="url(#ratingGradient)"
              dot={{ fill: "oklch(0.65 0.2 145)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "oklch(0.65 0.2 145)", stroke: "oklch(0.13 0.015 260)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
