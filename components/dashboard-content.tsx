"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { TrendingUp, Target, Zap, Lightbulb, X, ListTodo, ChevronRight, ArrowRight, Flame, Trophy } from "lucide-react";
import { KPICard } from "@/components/kpi-card";
import { PerformanceChart } from "@/components/performance-chart";
import { DrillRatingChart } from "@/components/drill-rating-chart";
import { SessionsByFocusChart } from "@/components/sessions-by-focus-chart";
import { RecentSessions } from "@/components/recent-sessions";
import { TopPerformers } from "@/components/top-performers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Fetcher: throw on non-OK so SWR sets error and we can show demo fallback + banner.
async function fetcher(url: string) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || res.statusText);
  return body;
}

// Dummy data when API fails (e.g. no DB) so dashboard still looks good for demo.
const dummyData = {
  playerCount: 8,
  sessionCount: 5,
  avgBatting: 32.5,
  strikeRate: 118.2,
  economy: 6.8,
  totalWickets: 12,
  wicketsPerSession: 2.4,
  recentSessions: [
    { id: "1", date: new Date().toISOString(), focus: "batting", age_group: "U16", duration_minutes: 90, num_players: 5 },
    { id: "2", date: new Date(Date.now() - 864e5).toISOString(), focus: "fitness", age_group: "College", duration_minutes: 45, num_players: 8 },
    { id: "3", date: new Date(Date.now() - 2 * 864e5).toISOString(), focus: "fielding", age_group: "U16", duration_minutes: 60, num_players: 6 },
  ],
  topPerformers: [
    { id: "1", name: "Rahul Sharma", role: "batter", avg_batting: 42.5, avg_strike_rate: 125, total_wickets: 0 },
    { id: "2", name: "Priya Patel", role: "bowler", avg_batting: 0, avg_strike_rate: 0, total_wickets: 8 },
  ],
  performanceTrend: [
    { session_date: new Date(Date.now() - 4 * 864e5).toISOString().slice(0, 10), batting: 28, strike_rate: 110, economy: 7.2 },
    { session_date: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), batting: 32, strike_rate: 118, economy: 6.5 },
    { session_date: new Date().toISOString().slice(0, 10), batting: 35, strike_rate: 122, economy: 6.2 },
  ],
  drillRatingTrend: [
    { session_date: new Date(Date.now() - 4 * 864e5).toISOString().slice(0, 10), avg_rating: 3.5 },
    { session_date: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), avg_rating: 4 },
    { session_date: new Date().toISOString().slice(0, 10), avg_rating: 4.2 },
  ],
  sessionsByFocus: [
    { focus: "batting", count: 2 },
    { focus: "bowling", count: 1 },
    { focus: "fielding", count: 1 },
    { focus: "fitness", count: 1 },
  ],
  insight: "Bowling economy is improving; maintain current plan.",
};

const DEMO_BANNER_KEY = "cricket-iq-demo-banner-dismissed";

export function DashboardContent() {
  const [player, setPlayer] = useState<string>("all");
  const [role, setRole] = useState<string>("all");
  const [range, setRange] = useState<string>("all");
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(DEMO_BANNER_KEY) === "1") {
      setDemoBannerDismissed(true);
    }
  }, []);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (player && player !== "all") p.set("player", player);
    if (role && role !== "all") p.set("role", role);
    if (range && range !== "all") p.set("range", range);
    return p.toString();
  }, [player, role, range]);

  const url = query ? `/api/dashboard?${query}` : "/api/dashboard";
  const { data, error, isLoading, isValidating } = useSWR(url, fetcher);

  const isDemoData = Boolean(error);
  const effectiveData = isDemoData ? dummyData : data;
  const isEmpty = !error && data?.sessionCount === 0;

  if (isLoading && !effectiveData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Demo data banner: shown when API unavailable (e.g. Supabase not configured); dismissible */}
      {isDemoData && !demoBannerDismissed && (
        <div
          role="status"
          className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm px-5 py-4 pr-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent" />
          <button
            type="button"
            aria-label="Dismiss demo data banner"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-amber-500/80 hover:bg-amber-500/10 transition-colors"
            onClick={() => {
              setDemoBannerDismissed(true);
              if (typeof window !== "undefined") sessionStorage.setItem(DEMO_BANNER_KEY, "1");
            }}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-amber-500">Using demo data</p>
              <p className="mt-0.5 text-sm text-amber-500/70">
                Connect Supabase to see real KPIs and charts. See <code className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs">docs/SUPABASE_SETUP.md</code> for setup.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state: API OK but no sessions yet */}
      {isEmpty && (
        <Card className="border-dashed border-muted-foreground/20 bg-muted/10 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground text-lg">No sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Set up Supabase, run the schema script, and add players and sessions to see KPIs and charts here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters: player, role, time range */}
      <section aria-label="Filter data">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              {isValidating && effectiveData && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Updating...
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time range</Label>
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger className="w-[160px] rounded-xl border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="5">Last 5 sessions</SelectItem>
                    <SelectItem value="10">Last 10 sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-[160px] rounded-xl border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="batter">Batter</SelectItem>
                    <SelectItem value="bowler">Bowler</SelectItem>
                    <SelectItem value="allrounder">All-rounder</SelectItem>
                    <SelectItem value="keeper">Keeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Player</Label>
                <PlayerSelect value={player} onValueChange={setPlayer} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* KPI Cards */}
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Batting Average"
          value={
            effectiveData?.avgBatting != null
              ? Number(effectiveData.avgBatting).toFixed(1)
              : "--"
          }
          subtitle="runs / max(1, dismissals)"
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Strike Rate"
          value={
            effectiveData?.strikeRate != null
              ? Number(effectiveData.strikeRate).toFixed(1)
              : "--"
          }
          subtitle="runs / balls x 100"
          icon={Zap}
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Bowling Economy"
          value={
            effectiveData?.economy != null
              ? Number(effectiveData.economy).toFixed(1)
              : "--"
          }
          subtitle="runs / over"
          icon={Target}
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Wickets/Session"
          value={
            effectiveData?.wicketsPerSession != null
              ? Number(effectiveData.wicketsPerSession).toFixed(1)
              : effectiveData?.totalWickets != null
                ? String(effectiveData.totalWickets)
                : "--"
          }
          subtitle="avg in selected range"
          icon={Target}
        />
      </section>

      {/* Insight card */}
      {effectiveData?.insight && (
        <Card className="overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/20">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-primary/70 mb-1">AI Insight</p>
              <p className="text-sm font-medium text-foreground">
                {effectiveData.insight}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary/50 hidden sm:block" />
          </CardContent>
        </Card>
      )}

      {/* Charts section */}
      <section aria-label="Charts" className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base font-semibold">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PerformanceChart data={effectiveData?.performanceTrend ?? []} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-base font-semibold">Drill Rating Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DrillRatingChart data={effectiveData?.drillRatingTrend ?? []} />
          </CardContent>
        </Card>
      </section>

      {/* Sessions by focus and performers */}
      <section aria-label="Sessions and performers" className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base font-semibold">Sessions by Focus</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SessionsByFocusChart data={effectiveData?.sessionsByFocus ?? []} />
            </CardContent>
          </Card>
        </div>
        <TopPerformers performers={effectiveData?.topPerformers ?? []} />
      </section>

      {/* Recent sessions + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSessions sessions={effectiveData?.recentSessions ?? []} />
        
        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickActionCard
            title="Match Scenarios"
            description="Chase/defend calculator and cricket IQ"
            href="/scenarios"
            icon={Target}
            gradient="from-primary/20 to-accent/10"
          />
          <QuickActionCard
            title="Practice Planner"
            description="Schedule practices and add drills"
            href="/practice"
            icon={ListTodo}
            gradient="from-accent/20 to-primary/10"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover-lift"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100", gradient)} />
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
          Get Started
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

function PlayerSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  const { data: players } = useSWR<{ id: string; name: string }[]>("/api/players", fetcher);
  const options = useMemo(() => {
    if (!players?.length) return [{ id: "all", name: "All players" }];
    return [{ id: "all", name: "All players" }, ...players];
  }, [players]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] rounded-xl border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
        <SelectValue placeholder="Player" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border/50">
        {options.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="rounded-2xl border-border/50 bg-card/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[160px] rounded-xl" />
            <Skeleton className="h-10 w-[160px] rounded-xl" />
            <Skeleton className="h-10 w-[180px] rounded-xl" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl border-border/50 bg-card/50">
            <CardContent className="p-6">
              <Skeleton className="mb-3 h-4 w-24 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-28 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-5 w-40 rounded-lg" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-5 w-48 rounded-lg" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
