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

  return (
    <div className="h-80 p-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="battingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="strikeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.6 0.18 200)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="oklch(0.6 0.18 200)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 260)" strokeOpacity={0.5} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "oklch(0.65 0.02 260)" }}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.22 0.02 260)" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "oklch(0.65 0.02 260)" }}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.22 0.02 260)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.13 0.015 260)",
              border: "1px solid oklch(0.22 0.02 260)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
            labelStyle={{ color: "oklch(0.98 0.005 260)", fontWeight: 600 }}
            itemStyle={{ color: "oklch(0.85 0.02 260)" }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => <span style={{ color: "oklch(0.75 0.02 260)", fontSize: "12px" }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="batting"
            name="Batting Avg"
            stroke="oklch(0.65 0.2 145)"
            strokeWidth={3}
            dot={{ fill: "oklch(0.65 0.2 145)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "oklch(0.65 0.2 145)", stroke: "oklch(0.13 0.015 260)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="strikeRate"
            name="Strike Rate"
            stroke="oklch(0.6 0.18 200)"
            strokeWidth={3}
            dot={{ fill: "oklch(0.6 0.18 200)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "oklch(0.6 0.18 200)", stroke: "oklch(0.13 0.015 260)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="economy"
            name="Economy Rate"
            stroke="oklch(0.7 0.15 85)"
            strokeWidth={3}
            dot={{ fill: "oklch(0.7 0.15 85)", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "oklch(0.7 0.15 85)", stroke: "oklch(0.13 0.015 260)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
