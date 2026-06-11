import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30", className)}>
      <div className="absolute -inset-px bg-gradient-to-br from-primary/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-xl group-hover:bg-primary/[0.06] transition-all duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</span>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm ring-1 ring-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:ring-primary/30">
            <Icon className="h-[18px] w-[18px] text-primary" />
          </div>
        </div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-[28px] font-bold tracking-tight text-foreground leading-none">{value}</span>
          {trend && (
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold leading-none",
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1.5 text-xs text-muted-foreground/60">{subtitle}</p>}
      </div>
    </div>
  );
}
