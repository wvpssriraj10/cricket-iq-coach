"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { KPICard } from "@/components/kpi-card";
import { RecentSessions } from "@/components/recent-sessions";
import { Skeleton } from "@/components/ui/skeleton";
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
import { UserPlus, Users, ClipboardList, Trash2, FileDown, Calendar, Zap, Target, Filter, Loader2 } from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

type Player = { id: string; name: string; role: string; age_group: string };
type Session = { id: string; date: string; focus: string; age_group: string; duration_minutes: number; num_players: number };

const ROLES = [
  { value: "batter", label: "Batter" },
  { value: "bowler", label: "Bowler" },
  { value: "allrounder", label: "All-rounder" },
  { value: "keeper", label: "Keeper" },
];

const AGE_GROUPS = [
  { value: "U12", label: "U12" },
  { value: "U16", label: "U16" },
  { value: "U19", label: "U19" },
  { value: "College", label: "College" },
];

const FOCUS_OPTIONS = [
  { value: "batting", label: "Batting" },
  { value: "bowling", label: "Bowling" },
  { value: "fielding", label: "Fielding" },
  { value: "fitness", label: "Fitness" },
];

const AGE_GROUPS_SESSION = [
  { value: "U12", label: "U12" },
  { value: "U13", label: "U13" },
  { value: "U15", label: "U15" },
  { value: "U16", label: "U16" },
  { value: "U17", label: "U17" },
  { value: "U19", label: "U19" },
  { value: "College", label: "College" },
  { value: "Senior", label: "Senior" },
];

function formatSessionLabel(s: Session) {
  const d = s.date.slice(0, 10);
  return `${d} – ${s.focus} (${s.duration_minutes} min)`;
}

const ROLE_CHART_COLORS: Record<string, string> = {
  batter: "var(--chart-1)",
  bowler: "var(--chart-2)",
  allrounder: "var(--chart-3)",
  keeper: "var(--chart-4)",
};

export default function PlayersPage() {
  const { data: players = [], error, isLoading, mutate } = useSWR<Player[]>("/api/players", fetcher);
  const { data: sessions = [], mutate: mutateSessions } = useSWR<Session[]>(
    "/api/sessions",
    fetcher
  );

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [sessions]
  );

  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>("all");

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchRole = filterRole === "all" || p.role === filterRole;
      const matchAge = filterAgeGroup === "all" || p.age_group === filterAgeGroup;
      return matchRole && matchAge;
    });
  }, [players, filterRole, filterAgeGroup]);

  const filteredRoleCounts = useMemo(() => {
    const counts: Record<string, number> = { batter: 0, bowler: 0, allrounder: 0, keeper: 0 };
    filteredPlayers.forEach((p) => {
      if (counts[p.role] != null) counts[p.role]++;
      else counts[p.role] = 1;
    });
    return counts;
  }, [filteredPlayers]);

  const filteredChartData = useMemo(
    () =>
      ROLES.map((r) => ({
        name: r.label,
        role: r.value,
        count: filteredRoleCounts[r.value] ?? 0,
        fill: ROLE_CHART_COLORS[r.value] ?? "var(--chart-5)",
      })),
    [filteredRoleCounts]
  );

  const [name, setName] = useState("");
  const [role, setRole] = useState("batter");
  const [ageGroup, setAgeGroup] = useState("U19");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Log performance (per player) dialog
  const [logPlayer, setLogPlayer] = useState<Player | null>(null);
  const [logSessionId, setLogSessionId] = useState("");
  const [logNewSession, setLogNewSession] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [newSessionFocus, setNewSessionFocus] = useState("batting");
  const [newSessionAgeGroup, setNewSessionAgeGroup] = useState("U19");
  const [newSessionDuration, setNewSessionDuration] = useState(60);
  const [newSessionNumPlayers, setNewSessionNumPlayers] = useState(1);
  const [logRunsScored, setLogRunsScored] = useState("");
  const [logBallsFaced, setLogBallsFaced] = useState("");
  const [logDismissals, setLogDismissals] = useState("");
  const [logOversBowled, setLogOversBowled] = useState("");
  const [logRunsConceded, setLogRunsConceded] = useState("");
  const [logWickets, setLogWickets] = useState("");
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logMsg, setLogMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Remove player confirmation
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [removing, setRemoving] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage({ type: "err", text: "Enter a name." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          role,
          age_group: ageGroup,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: body?.error ?? "Failed to add player." });
        return;
      }
      setName("");
      setMessage({ type: "ok", text: `${body.name ?? trimmed} added.` });
      mutate();
    } catch {
      setMessage({ type: "err", text: "Network error. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogPerformance(e: React.FormEvent) {
    e.preventDefault();
    if (!logPlayer) return;
    const hasBatting = logRunsScored !== "" || logBallsFaced !== "" || logDismissals !== "";
    const hasBowling = logOversBowled !== "" || logRunsConceded !== "" || logWickets !== "";
    if (!hasBatting && !hasBowling) {
      setLogMsg({ type: "err", text: "Enter at least one stat (batting or bowling)." });
      return;
    }
    let sessionId = logSessionId;
    if (logNewSession) {
      setLogSubmitting(true);
      setLogMsg(null);
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date(newSessionDate).toISOString(),
            focus: newSessionFocus,
            age_group: newSessionAgeGroup,
            duration_minutes: newSessionDuration,
            num_players: newSessionNumPlayers,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setLogMsg({ type: "err", text: body?.error ?? "Failed to create session." });
          setLogSubmitting(false);
          return;
        }
        sessionId = body.id;
        mutateSessions();
      } catch {
        setLogMsg({ type: "err", text: "Network error. Try again." });
        setLogSubmitting(false);
        return;
      }
    } else if (!sessionId) {
      setLogMsg({ type: "err", text: "Select a session or create a new one." });
      return;
    }
    setLogSubmitting(true);
    setLogMsg(null);
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: logPlayer.id,
          session_id: sessionId,
          runs_scored: logRunsScored === "" ? null : Number(logRunsScored),
          balls_faced: logBallsFaced === "" ? null : Number(logBallsFaced),
          dismissals: logDismissals === "" ? null : Number(logDismissals),
          overs_bowled: logOversBowled === "" ? null : Number(logOversBowled),
          runs_conceded: logRunsConceded === "" ? null : Number(logRunsConceded),
          wickets: logWickets === "" ? null : Number(logWickets),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLogMsg({ type: "err", text: body?.error ?? "Failed to save performance." });
        return;
      }
      setLogMsg({ type: "ok", text: "Performance recorded." });
      setLogRunsScored("");
      setLogBallsFaced("");
      setLogDismissals("");
      setLogOversBowled("");
      setLogRunsConceded("");
      setLogWickets("");
      setLogSessionId("");
      setTimeout(() => {
        setLogPlayer(null);
        setLogMsg(null);
      }, 1500);
    } catch {
      setLogMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setLogSubmitting(false);
    }
  }

  function openLogDialog(p: Player) {
    setLogPlayer(p);
    setLogSessionId("");
    setLogNewSession(false);
    setLogMsg(null);
    setLogRunsScored("");
    setLogBallsFaced("");
    setLogDismissals("");
    setLogOversBowled("");
    setLogRunsConceded("");
    setLogWickets("");
  }

  async function handleRemovePlayer() {
    if (!playerToRemove) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/players/${playerToRemove.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage({ type: "err", text: body?.error ?? "Failed to remove player." });
        return;
      }
      setMessage({ type: "ok", text: `${playerToRemove.name} removed.` });
      setPlayerToRemove(null);
      mutate();
    } catch {
      setMessage({ type: "err", text: "Network error. Try again." });
    } finally {
      setRemoving(false);
    }
  }

  async function handleDownloadProgress(p: Player) {
    setExportingId(p.id);
    try {
      const res = await fetch(`/api/players/${p.id}/export`);
      if (!res.ok) {
        setMessage({ type: "err", text: "Failed to generate document." });
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const name = (match?.[1] ?? `${p.name.replace(/\s+/g, "_")}_progress.docx`).replace(/"/g, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: "err", text: "Download failed." });
    } finally {
      setExportingId(null);
    }
  }

  // Edit Player State
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("batter");
  const [editAgeGroup, setEditAgeGroup] = useState("U19");
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleUpdatePlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlayer) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/players/${editingPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          age_group: editAgeGroup
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage({ type: "err", text: body?.error ?? "Failed to update player." });
        return;
      }

      setMessage({ type: "ok", text: "Player updated successfully." });
      setEditingPlayer(null);
      mutate();
    } catch (error) {
      setMessage({ type: "err", text: "Network error. Try again." });
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading && players.length === 0) {
    return (
      <AppShell title="Players" subtitle="Add and view your squad">
        <div className="mx-auto max-w-7xl space-y-6">
          <section aria-label="Filters" className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </section>
          <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Players" subtitle="Add and view your squad">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* SaaS-style filters */}
        <section
          aria-label="Filter players"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="h-6 w-px shrink-0 bg-border" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-role" className="sr-only">
                  Role
                </Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger
                    id="filter-role"
                    className="h-9 w-[140px] border-border/80 bg-background text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
                  >
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">All roles</SelectItem>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-age" className="sr-only">
                  Age group
                </Label>
                <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
                  <SelectTrigger
                    id="filter-age"
                    className="h-9 w-[130px] border-border/80 bg-background text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
                  >
                    <SelectValue placeholder="Age group" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">All ages</SelectItem>
                    {AGE_GROUPS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(filterRole !== "all" || filterAgeGroup !== "all") && (
              <>
                <div className="h-6 w-px shrink-0 bg-border" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setFilterRole("all");
                    setFilterAgeGroup("all");
                  }}
                >
                  Clear filters
                </Button>
              </>
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {filteredPlayers.length} of {players.length} players
          </span>
        </section>

        {/* KPI cards */}
        <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total players"
            value={error ? "—" : filteredPlayers.length}
            subtitle={filterRole !== "all" || filterAgeGroup !== "all" ? `of ${players.length} total` : "Squad size"}
            icon={Users}
          />
          <KPICard
            title="Total sessions"
            value={sessions.length}
            subtitle="All time"
            icon={Calendar}
          />
          <KPICard
            title="Batters"
            value={filteredRoleCounts.batter ?? 0}
            subtitle="Batting role"
            icon={Zap}
          />
          <KPICard
            title="Bowlers"
            value={(filteredRoleCounts.bowler ?? 0) + (filteredRoleCounts.allrounder ?? 0)}
            subtitle="Bowling roles"
            icon={Target}
          />
        </section>

        {/* 2-column: Chart + Recent sessions */}
        <section aria-label="Charts and activity" className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-xl border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold tracking-tight">Players by role</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                {filteredChartData.every((d) => d.count === 0) ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No players yet
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredChartData}
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
                        formatter={(value: number) => [value, "Players"]}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="count" name="Players" radius={[4, 4, 0, 0]}>
                        {filteredChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          <RecentSessions sessions={recentSessions} />
        </section>

        {/* 2-column: Add player + Squad list — first column sized to form so no gap */}
        <section aria-label="Squad management" className="grid gap-6 lg:grid-cols-[minmax(280px,28rem)_1fr]">
          <Card className="min-w-0 rounded-xl border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <UserPlus className="h-5 w-5" />
                Add player
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="player-name">Name</Label>
                  <Input
                    id="player-name"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Age group</Label>
                    <Select value={ageGroup} onValueChange={setAgeGroup}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_GROUPS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding…" : "Add player"}
                </Button>
              </form>
              {message && (
                <p
                  className={`mt-3 text-sm ${message.type === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                >
                  {message.text}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 rounded-xl border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Users className="h-5 w-5" />
                Squad ({error || isLoading ? "—" : filteredPlayers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  Could not load players. Check Supabase is set up and tables exist.
                </p>
              )}
              {!error && !isLoading && players.length === 0 && (
                <p className="rounded-lg border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  No players yet. Add one in the form.
                </p>
              )}
              {!error && !isLoading && players.length > 0 && filteredPlayers.length === 0 && (
                <p className="rounded-lg border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  No players match the current filters. Try changing role or age group.
                </p>
              )}
              {!error && !isLoading && filteredPlayers.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead className="text-muted-foreground">Role · Age</TableHead>
                      <TableHead className="w-[1%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {ROLES.find((r) => r.value === p.role)?.label ?? p.role} · {p.age_group}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-primary hover:bg-primary/10 hover:text-primary"
                              onClick={() => {
                                setEditingPlayer(p);
                                setEditName(p.name);
                                setEditRole(p.role);
                                setEditAgeGroup(p.age_group);
                              }}
                            >
                              <ClipboardList className="mr-1 h-3.5 w-3.5 sm:mr-1.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadProgress(p)}
                              disabled={exportingId === p.id}
                            >
                              <FileDown className="mr-1 h-3.5 w-3.5 sm:mr-1.5" />
                              <span className="hidden sm:inline">{exportingId === p.id ? "…" : "Download"}</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openLogDialog(p)}
                            >
                              <ClipboardList className="mr-1 h-3.5 w-3.5 sm:mr-1.5" />
                              <span className="hidden sm:inline">Log</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setPlayerToRemove(p)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Edit Player Dialog */}
        <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Player</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePlayer} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-age" className="text-right">
                  Age Group
                </Label>
                <Select value={editAgeGroup} onValueChange={setEditAgeGroup}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_GROUPS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Log performance dialog (manual data entry per player) */}
        <Dialog open={!!logPlayer} onOpenChange={(open) => !open && setLogPlayer(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Log performance – {logPlayer?.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogPerformance} className="space-y-4">
              <div className="space-y-2">
                <Label>Session</Label>
                <div className="flex gap-2">
                  <Select
                    value={logNewSession ? "__new__" : logSessionId}
                    onValueChange={(v) => {
                      setLogNewSession(v === "__new__");
                      if (v !== "__new__") setLogSessionId(v);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">Create new session</SelectItem>
                      {sessions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {formatSessionLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {logNewSession && (
                  <div className="mt-3 grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Date & time</Label>
                      <Input
                        type="datetime-local"
                        value={newSessionDate}
                        onChange={(e) => setNewSessionDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Focus</Label>
                      <Select value={newSessionFocus} onValueChange={setNewSessionFocus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FOCUS_OPTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Age group</Label>
                      <Select value={newSessionAgeGroup} onValueChange={setNewSessionAgeGroup}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_GROUPS_SESSION.map((a) => (
                            <SelectItem key={a.value} value={a.value}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (min)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newSessionDuration}
                        onChange={(e) => setNewSessionDuration(Number(e.target.value) || 60)}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs"># players</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newSessionNumPlayers}
                        onChange={(e) => setNewSessionNumPlayers(Number(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground">Batting</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Runs</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={logRunsScored}
                        onChange={(e) => setLogRunsScored(e.target.value)}
                        className="w-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Balls</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={logBallsFaced}
                        onChange={(e) => setLogBallsFaced(e.target.value)}
                        className="w-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dismissals</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={logDismissals}
                        onChange={(e) => setLogDismissals(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground">Bowling</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Overs</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="0"
                        value={logOversBowled}
                        onChange={(e) => setLogOversBowled(e.target.value)}
                        className="w-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Runs conceded</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={logRunsConceded}
                        onChange={(e) => setLogRunsConceded(e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Wickets</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={logWickets}
                        onChange={(e) => setLogWickets(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {logMsg && (
                <p
                  className={`text-sm ${logMsg.type === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                >
                  {logMsg.text}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLogPlayer(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={logSubmitting}>
                  {logSubmitting ? "Saving…" : "Save performance"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Remove player confirmation */}
        <Dialog open={!!playerToRemove} onOpenChange={(open) => !open && setPlayerToRemove(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Remove player</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Remove <strong>{playerToRemove?.name}</strong>? This will permanently delete them and
              all their performance data from the database. This cannot be undone.
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPlayerToRemove(null)}
                disabled={removing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemovePlayer}
                disabled={removing}
              >
                {removing ? "Removing…" : "Remove permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
