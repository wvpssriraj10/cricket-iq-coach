import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: KPICardProps) {
  return (
<<<<<<< HEAD
    <Card className={cn("overflow-hidden rounded-xl border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-md transition-all duration-200 hover:shadow-lg hover:border-primary/20", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
=======
    <Card className={cn(
      "group relative overflow-hidden rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover-lift gradient-border",
      className
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="text-4xl font-bold tracking-tight text-foreground">{value}</p>
>>>>>>> origin/website-enhancement
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    trend.isPositive 
                      ? "bg-primary/10 text-primary" 
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
<<<<<<< HEAD
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20 shadow-inner">
            <Icon className="h-6 w-6 text-primary" />
=======
              <p className="text-xs text-muted-foreground/80">{subtitle}</p>
            )}
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10">
            <Icon className="h-7 w-7 text-primary" />
>>>>>>> origin/website-enhancement
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </CardContent>
    </Card>
  );
}
