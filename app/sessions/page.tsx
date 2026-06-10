"use client";

import { useState } from "react";
import useSWR from "swr";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarPlus, ClipboardList } from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

type Session = { id: string; date: string; focus: string; age_group: string; duration_minutes: number; num_players: number };
type Player = { id: string; name: string; role: string; age_group: string };

const FOCUS_OPTIONS = [
  { value: "batting", label: "Batting" },
  { value: "bowling", label: "Bowling" },
  { value: "fielding", label: "Fielding" },
  { value: "fitness", label: "Fitness" },
];

const AGE_GROUPS = [
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

export default function SessionsPage() {
  const { data: sessions = [], mutate: mutateSessions } = useSWR<Session[]>("/api/sessions", fetcher);
  const { data: players = [] } = useSWR<Player[]>("/api/players", fetcher);

  // Add session state
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [sessionFocus, setSessionFocus] = useState("batting");
  const [sessionAgeGroup, setSessionAgeGroup] = useState("U19");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionNumPlayers, setSessionNumPlayers] = useState(1);
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Record performance state
  const [statSessionId, setStatSessionId] = useState("");
  const [statPlayerId, setStatPlayerId] = useState("");
  const [runsScored, setRunsScored] = useState("");
  const [ballsFaced, setBallsFaced] = useState("");
  const [dismissals, setDismissals] = useState("");
  const [oversBowled, setOversBowled] = useState("");
  const [runsConceded, setRunsConceded] = useState("");
  const [wickets, setWickets] = useState("");
  const [statSubmitting, setStatSubmitting] = useState(false);
  const [statMsg, setStatMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleAddSession(e: React.FormEvent) {
    e.preventDefault();
    setSessionSubmitting(true);
    setSessionMsg(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date(sessionDate).toISOString(),
          focus: sessionFocus,
          age_group: sessionAgeGroup,
          duration_minutes: sessionDuration,
          num_players: sessionNumPlayers,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSessionMsg({ type: "err", text: body?.error ?? "Failed to create session." });
        return;
      }
      setSessionMsg({ type: "ok", text: "Session created." });
      mutateSessions();
    } catch {
      setSessionMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setSessionSubmitting(false);
    }
  }

  async function handleRecordPerformance(e: React.FormEvent) {
    e.preventDefault();
    if (!statSessionId || !statPlayerId) {
      setStatMsg({ type: "err", text: "Select a session and a player." });
      return;
    }
    const hasBatting = runsScored !== "" || ballsFaced !== "" || dismissals !== "";
    const hasBowling = oversBowled !== "" || runsConceded !== "" || wickets !== "";
    if (!hasBatting && !hasBowling) {
      setStatMsg({ type: "err", text: "Enter at least one stat (batting or bowling)." });
      return;
    }
    setStatSubmitting(true);
    setStatMsg(null);
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: statSessionId,
          player_id: statPlayerId,
          runs_scored: runsScored === "" ? null : Number(runsScored),
          balls_faced: ballsFaced === "" ? null : Number(ballsFaced),
          dismissals: dismissals === "" ? null : Number(dismissals),
          overs_bowled: oversBowled === "" ? null : Number(oversBowled),
          runs_conceded: runsConceded === "" ? null : Number(runsConceded),
          wickets: wickets === "" ? null : Number(wickets),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatMsg({ type: "err", text: body?.error ?? "Failed to save performance." });
        return;
      }
      setStatMsg({ type: "ok", text: "Performance recorded." });
      setRunsScored("");
      setBallsFaced("");
      setDismissals("");
      setOversBowled("");
      setRunsConceded("");
      setWickets("");
    } catch {
      setStatMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setStatSubmitting(false);
    }
  }

  return (
    <AppShell title="Sessions" subtitle="Create sessions and record player performance">
      <div className="space-y-6">
        {/* Add session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarPlus className="h-5 w-5" />
              Add session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSession} className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>Date & time</Label>
                <Input
                  type="datetime-local"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="space-y-2">
                <Label>Focus</Label>
                <Select value={sessionFocus} onValueChange={setSessionFocus}>
                  <SelectTrigger className="w-32">
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
              <div className="space-y-2">
                <Label>Age group</Label>
                <Select value={sessionAgeGroup} onValueChange={setSessionAgeGroup}>
                  <SelectTrigger className="w-28">
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
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={1}
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value) || 60)}
                  className="w-24"
                />
              </div>
              <div className="space-y-2">
                <Label># players</Label>
                <Input
                  type="number"
                  min={1}
                  value={sessionNumPlayers}
                  onChange={(e) => setSessionNumPlayers(Number(e.target.value) || 1)}
                  className="w-20"
                />
              </div>
              <Button type="submit" disabled={sessionSubmitting}>
                {sessionSubmitting ? "Creating…" : "Create session"}
              </Button>
            </form>
            {sessionMsg && (
              <p
                className={`mt-3 text-sm ${sessionMsg.type === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
              >
                {sessionMsg.text}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Record performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5" />
              Record performance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Link a player to a session and add batting and/or bowling stats. Dashboard KPIs will update.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordPerformance} className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <Label>Session</Label>
                  <Select value={statSessionId} onValueChange={setStatSessionId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {formatSessionLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Player</Label>
                  <Select value={statPlayerId} onValueChange={setStatPlayerId}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground">Batting</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Runs</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={runsScored}
                        onChange={(e) => setRunsScored(e.target.value)}
                        className="w-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Balls faced</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={ballsFaced}
                        onChange={(e) => setBallsFaced(e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dismissals</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={dismissals}
                        onChange={(e) => setDismissals(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground">Bowling</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Overs</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="0"
                        value={oversBowled}
                        onChange={(e) => setOversBowled(e.target.value)}
                        className="w-20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Runs conceded</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={runsConceded}
                        onChange={(e) => setRunsConceded(e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Wickets</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={wickets}
                        onChange={(e) => setWickets(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={statSubmitting}>
                {statSubmitting ? "Saving…" : "Save performance"}
              </Button>
            </form>
            {statMsg && (
              <p
                className={`mt-3 text-sm ${statMsg.type === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
              >
                {statMsg.text}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
