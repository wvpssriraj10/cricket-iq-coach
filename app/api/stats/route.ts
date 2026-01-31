import { getDb, isSupabaseConfigured } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");
    const db = getDb();

    if (playerId) {
      const { data: stats, error } = await db
        .from("performance_stats")
        .select("*")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      const list = stats ?? [];
      const sessionIds = [...new Set(list.map((s: { session_id: string }) => s.session_id))];
      if (sessionIds.length === 0) return NextResponse.json([]);
      const { data: sessionsList } = await db.from("sessions").select("id, date").in("id", sessionIds);
      const dateBySession = new Map((sessionsList ?? []).map((s: { id: string; date: string }) => [s.id, s.date]));
      const rows = list.map((s: { session_id: string } & Record<string, unknown>) => ({
        ...s,
        session_date: dateBySession.get(s.session_id) ?? null,
      }));
      return NextResponse.json(rows);
    }

    const { data: sessionsData, error: sessionsError } = await db
      .from("sessions")
      .select("id, date")
      .order("date", { ascending: false })
      .limit(12);

    if (sessionsError) throw sessionsError;
    const sessions = sessionsData ?? [];
    const sessionIds = sessions.map((s) => s.id);
    const dateById = new Map(sessions.map((s) => [s.id, s.date]));

    if (sessionIds.length === 0) return NextResponse.json([]);

    const { data: statsData, error: statsError } = await db
      .from("performance_stats")
      .select("*")
      .in("session_id", sessionIds);

    if (statsError) throw statsError;
    const stats = statsData ?? [];

    const byDate = new Map<string, { runs: number; dismissals: number; balls: number; overs: number; conceded: number; wickets: number }>();
    for (const s of stats) {
      const sessionDate = dateById.get(s.session_id);
      if (!sessionDate) continue;
      const key = typeof sessionDate === "string" ? sessionDate.slice(0, 10) : String(sessionDate);
      const cur = byDate.get(key) ?? { runs: 0, dismissals: 0, balls: 0, overs: 0, conceded: 0, wickets: 0 };
      cur.runs += Number(s.runs_scored ?? 0);
      cur.dismissals += Number(s.dismissals ?? 0);
      cur.balls += Number(s.balls_faced ?? 0);
      cur.overs += Number(s.overs_bowled ?? 0);
      cur.conceded += Number(s.runs_conceded ?? 0);
      cur.wickets += Number(s.wickets ?? 0);
      byDate.set(key, cur);
    }

    const teamStats = Array.from(byDate.entries())
      .map(([session_date, cur]) => ({
        session_date,
        avg_batting: cur.dismissals > 0 ? Math.round((cur.runs / cur.dismissals) * 100) / 100 : 0,
        avg_strike_rate: cur.balls > 0 ? Math.round((cur.runs / cur.balls) * 100 * 100) / 100 : 0,
        avg_economy: cur.overs > 0 ? Math.round((cur.conceded / cur.overs) * 100) / 100 : 0,
        total_wickets: cur.wickets,
      }))
      .sort((a, b) => a.session_date.localeCompare(b.session_date))
      .reverse()
      .slice(0, 12);

    return NextResponse.json(teamStats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const body = await request.json();
    const {
      player_id,
      session_id,
      runs_scored,
      balls_faced,
      dismissals,
      overs_bowled,
      runs_conceded,
      wickets,
    } = body;

    if (!player_id || !session_id) {
      return NextResponse.json(
        { error: "player_id and session_id are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const { data, error } = await db
      .from("performance_stats")
      .insert({
        player_id,
        session_id,
        runs_scored: runs_scored != null ? Number(runs_scored) : null,
        balls_faced: balls_faced != null ? Number(balls_faced) : null,
        dismissals: dismissals != null ? Number(dismissals) : null,
        overs_bowled: overs_bowled != null ? Number(overs_bowled) : null,
        runs_conceded: runs_conceded != null ? Number(runs_conceded) : null,
        wickets: wickets != null ? Number(wickets) : null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating performance stat:", error);
    return NextResponse.json(
      { error: "Failed to create performance stat" },
      { status: 500 }
    );
  }
}
