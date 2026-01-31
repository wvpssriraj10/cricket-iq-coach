"use client";

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
import { BarChart2 } from "lucide-react";

interface SessionsByFocusChartProps {
  data: Array<{ focus: string; count: number }>;
}

const focusColors: Record<string, string> = {
  batting: "oklch(0.65 0.2 145)",
  bowling: "oklch(0.6 0.18 200)",
  fielding: "oklch(0.7 0.15 85)",
  fitness: "oklch(0.65 0.18 30)",
};

export function SessionsByFocusChart({ data }: SessionsByFocusChartProps) {
  const chartData = data.map((d) => ({
    name: d.focus.charAt(0).toUpperCase() + d.focus.slice(1),
    count: Number(d.count),
    fill: focusColors[d.focus] ?? "oklch(0.55 0.2 320)",
  }));

  return (
<<<<<<< HEAD
    <Card className="rounded-xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">
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
=======
    <div className="h-80 p-6">
      {chartData.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/30 mb-3">
            <BarChart2 className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">No session data</p>
>>>>>>> origin/website-enhancement
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              {Object.entries(focusColors).map(([key, color]) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1}/>
                  <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 260)" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "oklch(0.65 0.02 260)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.22 0.02 260)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.65 0.02 260)" }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.22 0.02 260)" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.13 0.015 260)",
                border: "1px solid oklch(0.22 0.02 260)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
              labelStyle={{ color: "oklch(0.98 0.005 260)", fontWeight: 600 }}
              formatter={(value: number) => [value, "Sessions"]}
              cursor={{ fill: "oklch(0.22 0.02 260 / 0.3)" }}
            />
            <Bar 
              dataKey="count" 
              name="Sessions" 
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, i) => (
                <Cell 
                  key={i} 
                  fill={entry.fill}
                  style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
