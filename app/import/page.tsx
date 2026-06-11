"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, Upload, AlertCircle, User, Check, ExternalLink, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { ConflictDialog, type PlayerConflict, type ConflictResolution } from "@/components/pdf-import/conflict-dialog";
import { ScorecardPreview } from "@/components/pdf-import/scorecard-preview";
import type { ParsedScorecard } from "@/lib/scorecard-parser";

type ImportedPlayer = { id: string; name: string };

const BATTING_ARM = [
  { value: "left", label: "Left arm" },
  { value: "right", label: "Right arm" },
];

const BOWLING_ARM = [
  { value: "left", label: "Left arm" },
  { value: "right", label: "Right arm" },
];

const BOWLER_TYPES = [
  { value: "fast", label: "Fast" },
  { value: "medium", label: "Medium" },
  { value: "spin", label: "Spin" },
  { value: "left_arm_orthodox", label: "Left-arm orthodox" },
  { value: "left_arm_fast", label: "Left-arm fast" },
  { value: "leg_break", label: "Leg break" },
  { value: "off_break", label: "Off break" },
  { value: "googly", label: "Googly" },
];

const BATTING_POSITIONS = [
  { value: "1", label: "1 (Opener)" },
  { value: "2", label: "2 (Opener)" },
  { value: "3", label: "3 (Top order)" },
  { value: "4", label: "4 (Middle)" },
  { value: "5", label: "5 (Middle)" },
  { value: "6", label: "6 (Middle)" },
  { value: "7", label: "7 (Lower)" },
  { value: "opener", label: "Opener (1–2)" },
  { value: "middle", label: "Middle order (3–6)" },
  { value: "lower", label: "Lower order (7–11)" },
];

const BOWLING_PHASES = [
  { value: "powerplay", label: "Powerplay (overs 1–6)" },
  { value: "middle", label: "Middle overs (7–15)" },
  { value: "death", label: "Death (16–20)" },
];

export default function ImportPage() {
  const router = useRouter();
  const { profile } = useAuth();
  
  useEffect(() => {
    if (profile?.role === 'player') {
      router.push('/');
    }
  }, [profile, router]);

  const [activeTab, setActiveTab] = useState<"excel" | "pdf">("pdf");

  // Excel state
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    created?: { players: number; sessions: number; stats: number };
    importedPlayers?: ImportedPlayer[];
    errors?: string[];
    message?: string;
    error?: string;
  } | null>(null);

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfImporting, setPdfImporting] = useState(false);
  const [pdfParseResult, setPdfParseResult] = useState<{
    scorecard: ParsedScorecard;
    pdfPlayerNames: string[];
    conflicts: PlayerConflict[];
    message: string;
  } | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pdfImportResult, setPdfImportResult] = useState<{
    message?: string;
    error?: string;
    team1?: { id: string; name: string };
    team2?: { id: string; name: string };
  } | null>(null);

  async function handlePdfUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfFile) return;
    setPdfParsing(true);
    setPdfParseResult(null);
    setPdfImportResult(null);
    try {
      const formData = new FormData();
      formData.set("file", pdfFile);
      const res = await fetch("/api/import/pdf", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPdfImportResult({ error: body?.error ?? "Failed to parse PDF" });
        return;
      }
      setPdfParseResult(body);
      if (body.conflicts?.length > 0) {
        setShowConflictDialog(true);
      }
    } catch {
      setPdfImportResult({ error: "Network error. Try again." });
    } finally {
      setPdfParsing(false);
    }
  }

  async function handlePdfConfirm(resolutions: ConflictResolution[]) {
    setShowConflictDialog(false);
    if (!pdfParseResult) return;
    setPdfImporting(true);
    try {
      const res = await fetch("/api/import/pdf/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scorecard: pdfParseResult.scorecard, resolutions }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPdfImportResult({ error: body?.error ?? "Import failed" });
        return;
      }
      setPdfImportResult(body);
      setPdfParseResult(null);
      setPdfFile(null);
    } catch {
      setPdfImportResult({ error: "Network error. Try again." });
    } finally {
      setPdfImporting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ error: body?.error ?? "Import failed" });
        return;
      }
      setResult({
        created: body.created,
        importedPlayers: body.importedPlayers ?? [],
        errors: body.errors,
        message: body.message,
      });
      setFile(null);
    } catch {
      setResult({ error: "Network error. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Import data" subtitle="Upload a PDF scorecard or an Excel/CSV/JSON file to import players and match data">
      <div className="space-y-6">
        {/* Tab switcher */}
        <div className="flex gap-1 rounded-xl border bg-muted/30 p-1 w-fit">
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "pdf"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            PDF Scorecard
          </button>
          <button
            onClick={() => setActiveTab("excel")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "excel"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel / CSV / JSON
          </button>
        </div>

        {/* ── PDF TAB ─────────────────────────────────────────────── */}
        {activeTab === "pdf" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Import match scorecard PDF
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a PDF scorecard (e.g. from CricHeroes). Both teams, all players, and their
                  match stats will be automatically extracted and saved. If two players share a
                  similar name you&apos;ll be asked to confirm if they&apos;re the same person.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePdfUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select .pdf scorecard file</Label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        setPdfFile(e.target.files?.[0] ?? null);
                        setPdfParseResult(null);
                        setPdfImportResult(null);
                      }}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
                    />
                  </div>
                  <Button type="submit" disabled={!pdfFile || pdfParsing || pdfImporting}>
                    {pdfParsing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing scorecard…</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> Parse Scorecard</>
                    )}
                  </Button>
                </form>

                {pdfImportResult?.error && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {pdfImportResult.error}
                  </div>
                )}

                {pdfImportResult?.message && !pdfImportResult.error && (
                  <div className="mt-4 rounded-lg border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20 p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-4 w-4" />
                      {pdfImportResult.message}
                    </p>
                    {pdfImportResult.team1 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Visit the <strong>Teams</strong> section to see {pdfImportResult.team1.name} and {pdfImportResult.team2?.name}.
                      </p>
                    )}
                  </div>
                )}

                {pdfParseResult && !pdfImportResult && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-muted-foreground">Scorecard preview</p>
                      {pdfParseResult.conflicts.length > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300"
                          onClick={() => setShowConflictDialog(true)}
                        >
                          <AlertCircle className="h-4 w-4" />
                          Resolve {pdfParseResult.conflicts.length} conflict(s) first
                        </Button>
                      ) : (
                        <Button size="sm" disabled={pdfImporting} onClick={() => handlePdfConfirm([])} className="gap-2">
                          {pdfImporting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                          ) : (
                            <><CheckCircle2 className="h-4 w-4" /> Confirm Import</>
                          )}
                        </Button>
                      )}
                    </div>
                    <ScorecardPreview
                      scorecard={pdfParseResult.scorecard}
                      pdfPlayerNames={pdfParseResult.pdfPlayerNames}
                      newPlayerCount={pdfParseResult.pdfPlayerNames.length}
                      reusedPlayerCount={0}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {pdfParseResult && (
              <ConflictDialog
                open={showConflictDialog}
                conflicts={pdfParseResult.conflicts}
                onResolved={(resolutions) => handlePdfConfirm(resolutions)}
                onCancel={() => setShowConflictDialog(false)}
              />
            )}
          </>
        )}

        {/* ── EXCEL TAB ──────────────────────────────────────────── */}
        {activeTab === "excel" && (
          <>
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Required columns
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your file must have <strong>at least</strong>:{" "}
                  <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">player_name</code>,{" "}
                  <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">session_date</code>.
                  Optional: role, age_group, session_focus, runs_scored, balls_faced, wickets, etc.
                  See <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">docs/EXCEL_IMPORT_FORMAT.md</code>.
                </p>
                <Button variant="outline" size="sm"
                  className="mt-2 w-fit border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50"
                  asChild>
                  <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />Open cricsheet.org
                  </a>
                </Button>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5" />
                  Upload file
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select .xlsx, .csv, or .json file</Label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
                    />
                  </div>
                  <Button type="submit" disabled={!file || submitting}>
                    {submitting ? "Importing…" : "Import"}
                  </Button>
                </form>

                {result && (
                  <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
                    <p className="mb-4 text-sm font-semibold tracking-tight text-muted-foreground">Import result</p>
                    {result.error && (
                      <p className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {result.error}
                      </p>
                    )}
                    {result.message && (
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">{result.message}</p>
                    )}
                    {result.created && (
                      <p className="text-sm text-muted-foreground">
                        Players: {result.created.players}, Sessions: {result.created.sessions}, Performance records:{" "}
                        {result.created.stats}
                      </p>
                    )}
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-3 rounded-lg border border-muted/50 bg-muted/20 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Warnings / skipped rows</p>
                        <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                          {result.errors.slice(0, 10).map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                          {result.errors.length > 10 && <li>… and {result.errors.length - 10} more</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {result?.importedPlayers && result.importedPlayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Complete player profiles
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    We found {result.importedPlayers.length} player(s) in the import. Add batting/bowling arm, bowler type, preferred position, and bowling phase.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {result.importedPlayers.map((player) => (
                      <PlayerProfileForm key={player.id} player={player} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function PlayerProfileForm({ player }: { player: ImportedPlayer }) {
  const [battingArm, setBattingArm] = useState("");
  const [bowlingArm, setBowlingArm] = useState("");
  const [bowlerType, setBowlerType] = useState("");
  const [battingPosition, setBattingPosition] = useState("");
  const [bowlingPhase, setBowlingPhase] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batting_arm: battingArm || null,
          bowling_arm: bowlingArm || null,
          bowler_type: bowlerType || null,
          preferred_batting_position: battingPosition || null,
          preferred_bowling_phase: bowlingPhase || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? "Failed to save");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
        <h3 className="text-base font-semibold tracking-tight">{player.name}</h3>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label className="text-xs">Batting arm</Label>
          <Select value={battingArm} onValueChange={setBattingArm}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {BATTING_ARM.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Bowling arm</Label>
          <Select value={bowlingArm} onValueChange={setBowlingArm}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {BOWLING_ARM.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Bowler type</Label>
          <Select value={bowlerType} onValueChange={setBowlerType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {BOWLER_TYPES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Preferred batting position</Label>
          <Select value={battingPosition} onValueChange={setBattingPosition}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {BATTING_POSITIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Preferred bowling phase</Label>
          <Select value={bowlingPhase} onValueChange={setBowlingPhase}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">—</SelectItem>
              {BOWLING_PHASES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}
