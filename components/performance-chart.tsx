"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceChartProps {
  data: Array<{
    session_date: string;
    batting: number | null;
    strike_rate: number | null;
    economy: number | null;
  }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.map((item) => ({
    week: new Date(item.session_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    batting: item.batting ? Number(item.batting).toFixed(1) : null,
    strikeRate: item.strike_rate
      ? Number(item.strike_rate).toFixed(1)
      : null,
    economy: item.economy ? Number(item.economy).toFixed(1) : null,
  }));

  const colors = {
    batting: "#2d6a4f",
    strikeRate: "#1e3a5f",
    economy: "#40916c",
  };

  return (
    <Card className="rounded-xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="batting"
                name="Batting Avg"
                stroke={colors.batting}
                strokeWidth={2}
                dot={{ fill: colors.batting, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="strikeRate"
                name="Strike Rate"
                stroke={colors.strikeRate}
                strokeWidth={2}
                dot={{ fill: colors.strikeRate, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="economy"
                name="Economy Rate"
                stroke={colors.economy}
                strokeWidth={2}
                dot={{ fill: colors.economy, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
