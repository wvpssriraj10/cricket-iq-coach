import { getDb, isSupabaseConfigured } from "@/lib/db";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

/** Excel serial date: days since 1899-12-30. */
function excelSerialToDateStr(n: number): string {
  const d = new Date((n - 25569) * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function normalizeRow(raw: Record<string, unknown>): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = normalizeKey(k);
    if (!key) continue;
    if (v == null || v === "") {
      out[key] = null;
      continue;
    }
    if (typeof v === "number") {
      out[key] = v;
      continue;
    }
    if (typeof v === "string") {
      out[key] = v.trim() || null;
      continue;
    }
    if (v instanceof Date) {
      out[key] = v.toISOString().slice(0, 10);
      continue;
    }
    out[key] = String(v).trim() || null;
  }
  return out;
}

function toDateStr(v: string | number | null): string | null {
  if (v == null) return null;
  if (typeof v === "string") {
    const match = v.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : null;
  }
  if (typeof v === "number" && v > 0) {
    return excelSerialToDateStr(v);
  }
  return null;
}

const ROLES = ["batter", "bowler", "allrounder", "keeper"];
const FOCUS = ["batting", "bowling", "fielding", "fitness"];
const AGE_GROUPS = ["U12", "U13", "U15", "U16", "U17", "U19", "College", "Senior"];

/** Parse uploaded file to array of row objects. Supports .xlsx, .xls, .csv, .json */
async function parseFileToRows(
  file: File
): Promise<Record<string, unknown>[]> {
  const name = (file.name || "").toLowerCase();
  const isCsv = name.endsWith(".csv");
  const isJson = name.endsWith(".json");
  const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");

  if (isJson) {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length === 0) return [];
    return arr as Record<string, unknown>[];
  }

  if (isCsv) {
    const text = await file.text();
    const workbook = XLSX.read(text, { type: "string", raw: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  }

  if (isExcel) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  }

  throw new Error("Unsupported file type. Use .xlsx, .xls, .csv, or .json");
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Upload a file (form field: file). Accepted: .xlsx, .xls, .csv, .json" },
        { status: 400 }
      );
    }

    const rawRows = await parseFileToRows(file);
    if (rawRows.length === 0) {
      return NextResponse.json(
        { error: "No data rows. Use a header row (Excel/CSV) or an array of objects (JSON)." },
        { status: 400 }
      );
    }

    const rows = rawRows.map((r) => normalizeRow(r));
    const db = getDb();

    const created = { players: 0, sessions: 0, stats: 0 };
    const playerByName = new Map<string, string>();
    const sessionByKey = new Map<string, string>();
    const errors: string[] = [];

    for (const row of rows) {
      const playerName = (row.player_name ?? row.playername ?? "") as string;
      const sessionDateStr = toDateStr(row.session_date ?? row.sessiondate ?? null);
      const sessionFocus = String(row.session_focus ?? row.sessionfocus ?? "batting").toLowerCase();

      if (!playerName || !sessionDateStr) {
        errors.push(`Row skipped: missing player_name or session_date`);
        continue;
      }

      const role = ROLES.includes(String(row.role ?? "").toLowerCase())
        ? String(row.role).toLowerCase()
        : "batter";
      const ageGroup = AGE_GROUPS.includes(String(row.age_group ?? row.agegroup ?? "U19"))
        ? String(row.age_group ?? row.agegroup)
        : "U19";
      const focus = FOCUS.includes(sessionFocus) ? sessionFocus : "batting";
      const duration = Number(row.session_duration_minutes ?? row.session_duration ?? 60) || 60;
      const numPlayers = Number(row.session_num_players ?? row.session_numplayers ?? 1) || 1;
      const sessionAgeGroup = AGE_GROUPS.includes(String(row.session_age_group ?? ageGroup))
        ? String(row.session_age_group ?? ageGroup)
        : ageGroup;

      let playerId = playerByName.get(playerName);
      if (!playerId) {
        const { data: existing } = await db
          .from("players")
          .select("id")
          .ilike("name", playerName)
          .limit(1)
          .maybeSingle();
        if (existing?.id) {
          playerId = existing.id;
        } else {
          const { data: inserted, error: insertErr } = await db
            .from("players")
            .insert({ name: playerName, role, age_group: ageGroup })
            .select("id")
            .single();
          if (insertErr) {
            errors.push(`Player "${playerName}": ${insertErr.message}`);
            continue;
          }
          playerId = inserted.id;
          created.players++;
        }
        playerByName.set(playerName, playerId!);
      }

      const sessionKey = `${sessionDateStr}_${focus}`;
      let sessionId = sessionByKey.get(sessionKey);
      if (!sessionId) {
        const dateIso = `${sessionDateStr}T12:00:00.000Z`;
        const { data: existing } = await db
          .from("sessions")
          .select("id")
          .gte("date", dateIso)
          .lt("date", `${sessionDateStr}T23:59:59.999Z`)
          .eq("focus", focus)
          .limit(1)
          .maybeSingle();
        if (existing?.id) {
          sessionId = existing.id;
        } else {
          const { data: inserted, error: insertErr } = await db
            .from("sessions")
            .insert({
              date: dateIso,
              focus,
              age_group: sessionAgeGroup,
              duration_minutes: duration,
              num_players: numPlayers,
            })
            .select("id")
            .single();
          if (insertErr) {
            errors.push(`Session ${sessionKey}: ${insertErr.message}`);
            continue;
          }
          sessionId = inserted.id;
          created.sessions++;
        }
        sessionByKey.set(sessionKey, sessionId!);
      }

      const runsScored =
        row.runs_scored != null || (row as Record<string, unknown>).runsscored != null
          ? Number(row.runs_scored ?? (row as Record<string, unknown>).runsscored)
          : null;
      const ballsFaced =
        row.balls_faced != null || (row as Record<string, unknown>).ballsfaced != null
          ? Number(row.balls_faced ?? (row as Record<string, unknown>).ballsfaced)
          : null;
      const dismissals = row.dismissals != null ? Number(row.dismissals) : null;
      const oversBowled =
        row.overs_bowled != null || (row as Record<string, unknown>).oversbowled != null
          ? Number(row.overs_bowled ?? (row as Record<string, unknown>).oversbowled)
          : null;
      const runsConceded =
        row.runs_conceded != null || (row as Record<string, unknown>).runsconceded != null
          ? Number(row.runs_conceded ?? (row as Record<string, unknown>).runsconceded)
          : null;
      const wickets = row.wickets != null ? Number(row.wickets) : null;

      const { error: statErr } = await db.from("performance_stats").insert({
        player_id: playerId,
        session_id: sessionId,
        runs_scored: runsScored ?? null,
        balls_faced: ballsFaced ?? null,
        dismissals: dismissals ?? null,
        overs_bowled: oversBowled ?? null,
        runs_conceded: runsConceded ?? null,
        wickets: wickets ?? null,
      });
      if (statErr) {
        errors.push(`Stats for ${playerName} @ ${sessionDateStr}: ${statErr.message}`);
        continue;
      }
      created.stats++;
    }

    const importedPlayers = Array.from(playerByName.entries()).map(([name, id]) => ({
      id,
      name,
    }));

    return NextResponse.json({
      created,
      importedPlayers,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported: ${created.players} players, ${created.sessions} sessions, ${created.stats} performance records.`,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
