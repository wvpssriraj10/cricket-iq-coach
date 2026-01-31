"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { TrendingUp, Target, Zap, Lightbulb, X, ListTodo } from "lucide-react";
import { KPICard } from "@/components/kpi-card";
import { PerformanceChart } from "@/components/performance-chart";
import { DrillRatingChart } from "@/components/drill-rating-chart";
import { SessionsByFocusChart } from "@/components/sessions-by-focus-chart";
import { RecentSessions } from "@/components/recent-sessions";
import { TopPerformers } from "@/components/top-performers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
          className="relative rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 pr-10 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <button
            type="button"
            aria-label="Dismiss demo data banner"
            className="absolute right-2 top-2 rounded p-1 text-amber-600 hover:bg-amber-200/50 dark:text-amber-300 dark:hover:bg-amber-800/50"
            onClick={() => {
              setDemoBannerDismissed(true);
              if (typeof window !== "undefined") sessionStorage.setItem(DEMO_BANNER_KEY, "1");
            }}
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-medium">Using demo data</p>
          <p className="mt-1 text-amber-700 dark:text-amber-300">
            Connect Supabase to see real KPIs and charts. See <code className="rounded bg-amber-200/50 px-1 dark:bg-amber-800/50">docs/SUPABASE_SETUP.md</code> in the project for setup.
          </p>
        </div>
      )}

      {/* Empty state: API OK but no sessions yet */}
      {isEmpty && (
        <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="font-medium text-foreground">No sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up Supabase, run the schema script, and add players and sessions to see KPIs and charts here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters: player, role, time range */}
      <section aria-label="Filter data">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
            {isValidating && effectiveData && (
              <span className="text-xs text-muted-foreground">Updating…</span>
            )}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Time range</Label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="5">Last 5 sessions</SelectItem>
                  <SelectItem value="10">Last 10 sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="batter">Batter</SelectItem>
                  <SelectItem value="bowler">Bowler</SelectItem>
                  <SelectItem value="allrounder">All-rounder</SelectItem>
                  <SelectItem value="keeper">Keeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Player</Label>
              <PlayerSelect value={player} onValueChange={setPlayer} />
            </div>
          </div>
        </CardContent>
      </Card>
      </section>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Batting average"
          value={
            effectiveData?.avgBatting != null
              ? Number(effectiveData.avgBatting).toFixed(1)
              : "—"
          }
          subtitle="runs / max(1, dismissals)"
          icon={TrendingUp}
        />
        <KPICard
          title="Strike rate"
          value={
            effectiveData?.strikeRate != null
              ? Number(effectiveData.strikeRate).toFixed(1)
              : "—"
          }
          subtitle="runs / balls × 100"
          icon={Zap}
        />
        <KPICard
          title="Bowling economy"
          value={
            effectiveData?.economy != null
              ? Number(effectiveData.economy).toFixed(1)
              : "—"
          }
          subtitle="runs / over"
          icon={Target}
        />
        <KPICard
          title="Wickets per session"
          value={
            effectiveData?.wicketsPerSession != null
              ? Number(effectiveData.wicketsPerSession).toFixed(1)
              : effectiveData?.totalWickets != null
                ? String(effectiveData.totalWickets)
                : "—"
          }
          subtitle="avg in selected range"
          icon={Target}
        />
      </section>

      {/* Insight rule-based text */}
      {effectiveData?.insight && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {effectiveData.insight}
            </p>
          </CardContent>
        </Card>
      )}

      <section aria-label="Charts" className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart data={effectiveData?.performanceTrend ?? []} />
        <DrillRatingChart data={effectiveData?.drillRatingTrend ?? []} />
      </section>
      <section aria-label="Sessions and performers" className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SessionsByFocusChart data={effectiveData?.sessionsByFocus ?? []} />
        </div>
        <TopPerformers performers={effectiveData?.topPerformers ?? []} />
      </section>

      {/* Recent sessions + CTAs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSessions sessions={effectiveData?.recentSessions ?? []} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="overflow-hidden transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold">Match Scenarios</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Chase/defend calculator and cricket IQ
              </p>
              <a
                href="/scenarios"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Try Scenarios
              </a>
            </CardContent>
          </Card>
          <Card className="overflow-hidden transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold">Practice Planner</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Schedule practices and add drills
              </p>
              <a
                href="/practice"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Plan Practice
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Player" />
      </SelectTrigger>
      <SelectContent>
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Skeleton className="h-9 w-[140px]" />
            <Skeleton className="h-9 w-[140px]" />
            <Skeleton className="h-9 w-[180px]" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-5 w-48" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-5 w-32" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
