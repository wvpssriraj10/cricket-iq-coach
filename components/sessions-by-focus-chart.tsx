"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SessionsByFocusChartProps {
  data: Array<{ focus: string; count: number }>;
}

const focusColors: Record<string, string> = {
  batting: "var(--chart-1)",
  bowling: "var(--chart-2)",
  fielding: "var(--chart-3)",
  fitness: "var(--chart-4)",
};

export function SessionsByFocusChart({ data }: SessionsByFocusChartProps) {
  const chartData = data.map((d) => ({
    name: d.focus.charAt(0).toUpperCase() + d.focus.slice(1),
    count: Number(d.count),
    fill: focusColors[d.focus] ?? "var(--chart-5)",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Sessions by Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {chartData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No session data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [value, "Sessions"]}
                  labelFormatter={(label) => label}
                />
                <Bar dataKey="count" name="Sessions" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
