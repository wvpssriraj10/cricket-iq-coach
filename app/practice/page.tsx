"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CalendarPlus, ListTodo, Plus, Star, Dumbbell } from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

type Session = {
  id: string;
  date: string;
  focus: string;
  age_group: string;
  duration_minutes: number;
  num_players: number;
};
type Drill = {
  id: string;
  session_id: string;
  name: string;
  type: string;
  planned_duration_minutes: number;
  coaching_tip: string | null;
};
type DrillCatalogItem = {
  id: number;
  name: string;
  type: string;
  duration_minutes: number;
  description: string | null;
  coaching_tip: string | null;
};
type DrillResult = { id: string; drill_id: string; rating_1_5: number | null; notes: string | null };

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

function SessionDrills({
  sessionId,
  onAddDrill,
}: {
  sessionId: string;
  onAddDrill: () => void;
}) {
  const { data: drills = [], mutate } = useSWR<Drill[]>(
    sessionId ? `/api/drills?session_id=${sessionId}` : null,
    fetcher
  );
  const { data: results = [] } = useSWR<DrillResult[]>(
    sessionId ? `/api/drill-results?session_id=${sessionId}` : null,
    fetcher
  );
  const resultsByDrill = Object.fromEntries(results.map((r) => [r.drill_id, r]));
  const [ratingDrillId, setRatingDrillId] = useState<string | null>(null);
  const [rating, setRating] = useState("");
  const [ratingNotes, setRatingNotes] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  async function handleSaveRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingDrillId) return;
    const r = Number(rating);
    if (r < 1 || r > 5) return;
    setRatingSubmitting(true);
    try {
      const res = await fetch("/api/drill-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drill_id: ratingDrillId,
          rating_1_5: r,
          notes: ratingNotes.trim() || null,
        }),
      });
      if (res.ok) {
        setRatingDrillId(null);
        setRating("");
        setRatingNotes("");
        mutate();
      }
    } finally {
      setRatingSubmitting(false);
    }
  }

  if (!sessionId) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Drills in this practice</p>
        <Button type="button" variant="outline" size="sm" onClick={onAddDrill}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add drill
        </Button>
      </div>
      {drills.length === 0 ? (
        <p className="rounded-md border border-dashed bg-muted/30 px-3 py-4 text-center text-sm text-muted-foreground">
          No drills yet. Add one from the catalog.
        </p>
      ) : (
        <ul className="space-y-2">
          {drills.map((d) => {
            const result = resultsByDrill[d.id];
            return (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground">
                    {d.type} · {d.planned_duration_minutes} min
                  </span>
                  {result?.rating_1_5 != null && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      <Star className="h-3 w-3" />
                      {result.rating_1_5}/5
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRatingDrillId(d.id);
                    setRating(result?.rating_1_5?.toString() ?? "");
                    setRatingNotes(result?.notes ?? "");
                  }}
                >
                  {result ? "Edit rating" : "Record result"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!ratingDrillId} onOpenChange={(open) => !open && setRatingDrillId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record drill result</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRating} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating (1–5)</Label>
              <Select
                value={rating}
                onValueChange={setRating}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} – {n <= 2 ? "Needs work" : n === 3 ? "OK" : "Good"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={ratingNotes}
                onChange={(e) => setRatingNotes(e.target.value)}
                placeholder="e.g. focus on follow-through"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRatingDrillId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={ratingSubmitting || !rating}>
                {ratingSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PracticePlannerPage() {
  const { mutate: globalMutate } = useSWRConfig();
  const { data: sessions = [], mutate: mutateSessions } = useSWR<Session[]>("/api/sessions", fetcher);
  const { data: catalog = [] } = useSWR<DrillCatalogItem[]>("/api/drill-catalog", fetcher);

  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [sessionFocus, setSessionFocus] = useState("batting");
  const [sessionAgeGroup, setSessionAgeGroup] = useState("U19");
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionNumPlayers, setSessionNumPlayers] = useState(1);
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [addDrillSessionId, setAddDrillSessionId] = useState<string | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("batting");
  const [customDuration, setCustomDuration] = useState(15);
  const [addDrillSubmitting, setAddDrillSubmitting] = useState(false);

  const catalogByType = catalog.reduce(
    (acc, item) => {
      const t = item.type;
      if (!acc[t]) acc[t] = [];
      acc[t].push(item);
      return acc;
    },
    {} as Record<string, DrillCatalogItem[]>
  );

  async function handleSchedulePractice(e: React.FormEvent) {
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
        setSessionMsg({ type: "err", text: body?.error ?? "Failed to create practice." });
        return;
      }
      setSessionMsg({ type: "ok", text: "Practice scheduled. Add drills below." });
      mutateSessions();
    } catch {
      setSessionMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setSessionSubmitting(false);
    }
  }

  async function handleAddDrill(e: React.FormEvent) {
    e.preventDefault();
    if (!addDrillSessionId) return;
    const fromCatalog = catalog.find((c) => String(c.id) === selectedCatalogId);
    const name = fromCatalog ? fromCatalog.name : customName.trim();
    const type = fromCatalog ? fromCatalog.type : customType;
    const duration = fromCatalog ? fromCatalog.duration_minutes : customDuration;
    const coaching_tip = fromCatalog?.coaching_tip ?? null;
    if (!name) return;
    setAddDrillSubmitting(true);
    try {
      const res = await fetch("/api/drills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: addDrillSessionId,
          name,
          type,
          planned_duration_minutes: duration,
          coaching_tip,
        }),
      });
      if (res.ok) {
        const sid = addDrillSessionId;
        setAddDrillSessionId(null);
        setSelectedCatalogId("");
        setCustomName("");
        if (sid) void globalMutate(`/api/drills?session_id=${sid}`);
      }
    } finally {
      setAddDrillSubmitting(false);
    }
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AppShell title="Practice Planner" subtitle="Schedule practices and add drills from the catalog">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Schedule a practice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarPlus className="h-5 w-5" />
              Schedule a practice
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a session, then add drills from the catalog and record results after practice.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedulePractice} className="flex flex-wrap items-end gap-4">
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
                {sessionSubmitting ? "Creating…" : "Schedule practice"}
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

        {/* Your practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListTodo className="h-5 w-5" />
              Your practices
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Expand a practice to add drills and record ratings (1–5) after the session.
            </p>
          </CardHeader>
          <CardContent>
            {sortedSessions.length === 0 ? (
              <p className="rounded-md border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                No practices yet. Schedule one above.
              </p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {sortedSessions.map((s) => (
                  <AccordionItem key={s.id} value={s.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-left font-medium">{formatSessionLabel(s)}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <SessionDrills
                        sessionId={s.id}
                        onAddDrill={() => {
                          setAddDrillSessionId(s.id);
                          setSelectedCatalogId("");
                          setCustomName("");
                        }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Add drill dialog */}
        <Dialog open={!!addDrillSessionId} onOpenChange={(open) => !open && setAddDrillSessionId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add drill to practice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDrill} className="space-y-4">
              <div className="space-y-2">
                <Label>From catalog</Label>
                <Select value={selectedCatalogId || "none"} onValueChange={(v) => setSelectedCatalogId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a drill (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (custom drill)</SelectItem>
                    {(catalogByType.batting ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        Batting: {c.name} ({c.duration_minutes} min)
                      </SelectItem>
                    ))}
                    {(catalogByType.bowling ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        Bowling: {c.name} ({c.duration_minutes} min)
                      </SelectItem>
                    ))}
                    {(catalogByType.fielding ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        Fielding: {c.name} ({c.duration_minutes} min)
                      </SelectItem>
                    ))}
                    {(catalogByType.fitness ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        Fitness: {c.name} ({c.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Or add a custom drill:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Name</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Custom net drill"
                    disabled={!!selectedCatalogId}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={customType}
                    onValueChange={setCustomType}
                    disabled={!!selectedCatalogId}
                  >
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
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value) || 15)}
                    disabled={!!selectedCatalogId}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDrillSessionId(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addDrillSubmitting || (!selectedCatalogId && !customName.trim())}
                >
                  {addDrillSubmitting ? "Adding…" : "Add drill"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
