"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  TrendingUp, Target, Zap, Lightbulb, X, ListTodo, ArrowRight, Flame, Trophy,
  Sparkles, Activity, Users, Clock, BarChart3, ChevronRight, Eye
} from "lucide-react";
import { KPICard } from "@/components/kpi-card";
import { PerformanceChart } from "@/components/performance-chart";
import { DrillRatingChart } from "@/components/drill-rating-chart";
import { SessionsByFocusChart } from "@/components/sessions-by-focus-chart";
import { RecentSessions } from "@/components/recent-sessions";
import { TopPerformers } from "@/components/top-performers";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

async function fetcher(url: string) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || res.statusText);
  return body;
}

const dummyData = {
  playerCount: 8, sessionCount: 5, avgBatting: 32.5, strikeRate: 118.2,
  economy: 6.8, totalWickets: 12, wicketsPerSession: 2.4,
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
    { focus: "batting", count: 2 }, { focus: "bowling", count: 1 },
    { focus: "fielding", count: 1 }, { focus: "fitness", count: 1 },
  ],
  insight: "Bowling economy is improving; maintain current plan.",
};

const DEMO_BANNER_KEY = "cricket-iq-demo-banner-dismissed";

export function DashboardContent({ profile }: { profile?: { role: string; player_id: string } }) {
  const [player, setPlayer] = useState("all");
  const [role, setRole] = useState("all");
  const [range, setRange] = useState("all");
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

  if (isLoading && !effectiveData) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/60 p-[2px] shadow-2xl shadow-primary/20">
        <div className="relative rounded-3xl bg-background">
          <div className="px-8 pt-7 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </span>
                  <h2 className="text-xl font-bold text-foreground">Welcome back</h2>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground/80 ml-10">
                  Here&rsquo;s your team&rsquo;s performance snapshot.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground/60">
                <Clock className="h-3.5 w-3.5" />
                <span>Last updated: today</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/30 px-5 py-3 ring-1 ring-border/40">
              <div className="flex items-center gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Players</span>
                  <span className="font-bold text-foreground">{effectiveData?.playerCount ?? 0}</span>
                </div>
                <div className="h-4 w-px bg-border/60" />
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-bold text-foreground">{effectiveData?.sessionCount ?? 0}</span>
                </div>
                <div className="h-4 w-px bg-border/60" />
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Avg Rating</span>
                  <span className="font-bold text-foreground">4.2</span>
                </div>
              </div>
              {profile?.role === 'player' && (
                <Button size="sm" className="rounded-xl shadow-lg shadow-primary/20">
                  <Target className="h-3.5 w-3.5" />
                  Request Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDemoData && !demoBannerDismissed && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent px-5 py-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent" />
          <button type="button" aria-label="Dismiss" className="absolute right-3 top-3 rounded-lg p-1.5 text-amber-500/80 hover:bg-amber-500/10 transition-colors"
            onClick={() => { setDemoBannerDismissed(true); if (typeof window !== "undefined") sessionStorage.setItem(DEMO_BANNER_KEY, "1"); }}>
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-amber-500">Using demo data</p>
              <p className="text-sm text-amber-500/70">Connect Supabase to see real KPIs.</p>
            </div>
          </div>
        </div>
      )}

      {isEmpty && (
        <Card className="border-dashed border-muted-foreground/30 bg-muted/20 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Trophy className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-semibold text-foreground">No sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">Set up Supabase and add players to see KPIs here.</p>
          </CardContent>
        </Card>
      )}

      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {isValidating && effectiveData && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Updating...
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Time</Label>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[140px] h-9 rounded-xl border-border/40 bg-muted/30 text-xs"><SelectValue placeholder="Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="5">Last 5</SelectItem>
                <SelectItem value="10">Last 10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[140px] h-9 rounded-xl border-border/40 bg-muted/30 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="batter">Batter</SelectItem>
                <SelectItem value="bowler">Bowler</SelectItem>
                <SelectItem value="allrounder">All-rounder</SelectItem>
                <SelectItem value="keeper">Keeper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Player</Label>
            <PlayerSelect value={player} onValueChange={setPlayer} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Batting Average" value={effectiveData?.avgBatting != null ? Number(effectiveData.avgBatting).toFixed(1) : "--"} subtitle="runs per dismissal" icon={TrendingUp} trend={{ value: 12, isPositive: true }} />
        <KPICard title="Strike Rate" value={effectiveData?.strikeRate != null ? Number(effectiveData.strikeRate).toFixed(1) : "--"} subtitle="runs per 100 balls" icon={Zap} trend={{ value: 8, isPositive: true }} />
        <KPICard title="Bowling Economy" value={effectiveData?.economy != null ? Number(effectiveData.economy).toFixed(1) : "--"} subtitle="runs per over" icon={Target} trend={{ value: 5, isPositive: true }} />
        <KPICard title="Wickets/Session" value={effectiveData?.wicketsPerSession != null ? Number(effectiveData.wicketsPerSession).toFixed(1) : effectiveData?.totalWickets ?? "--"} subtitle="avg in range" icon={Activity} />
      </div>

      {effectiveData?.insight && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/15 via-accent/5 to-transparent border border-accent/20 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 shadow-sm ring-1 ring-accent/30">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Coaching Insight</p>
              <p className="mt-0.5 text-sm text-muted-foreground/90">{effectiveData.insight}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/40 bg-gradient-to-r from-muted/50 to-transparent px-6 py-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Performance Trend
            </h3>
          </div>
          <div className="p-0">
            <PerformanceChart data={effectiveData?.performanceTrend ?? []} />
          </div>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border/40 bg-gradient-to-r from-muted/50 to-transparent px-6 py-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Drill Rating Trend
            </h3>
          </div>
          <div className="p-0">
            <DrillRatingChart data={effectiveData?.drillRatingTrend ?? []} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden h-full">
            <div className="border-b border-border/40 bg-gradient-to-r from-muted/50 to-transparent px-6 py-4">
              <h3 className="font-bold text-foreground">Sessions by Focus</h3>
            </div>
            <div className="p-0">
              <SessionsByFocusChart data={effectiveData?.sessionsByFocus ?? []} />
            </div>
          </div>
        </div>
        <TopPerformers performers={effectiveData?.topPerformers ?? []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSessions sessions={effectiveData?.recentSessions ?? []} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="/scenarios"
            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Match Scenarios</h3>
              <p className="mt-1 text-sm text-muted-foreground/70">Chase/defend calculator &amp; cricket IQ trainer</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                Launch <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>
          <a href="/practice"
            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Practice Planner</h3>
              <p className="mt-1 text-sm text-muted-foreground/70">Schedule practices, add drills &amp; track progress</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function PlayerSelect({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  const { data: players } = useSWR<{ id: string; name: string }[]>("/api/players", fetcher);
  const options = useMemo(() => {
    if (!players?.length) return [{ id: "all", name: "All players" }];
    return [{ id: "all", name: "All players" }, ...players];
  }, [players]);
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] h-9 rounded-xl border-border/40 bg-muted/30 text-xs"><SelectValue placeholder="Player" /></SelectTrigger>
      <SelectContent>
        {options.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
      </SelectContent>
    </Select>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-card/50 p-6"><Skeleton className="h-5 w-48 rounded-lg" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card p-6">
            <Skeleton className="h-4 w-24 rounded-lg mb-3" />
            <Skeleton className="h-10 w-20 rounded-lg mb-2" />
            <Skeleton className="h-3 w-28 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card p-6">
            <Skeleton className="h-5 w-40 rounded-lg mb-4" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
