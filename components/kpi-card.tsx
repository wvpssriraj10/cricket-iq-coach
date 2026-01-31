import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <Card className={cn("overflow-hidden rounded-xl border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-md transition-all duration-200 hover:shadow-lg hover:border-primary/20", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-primary" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20 shadow-inner">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
