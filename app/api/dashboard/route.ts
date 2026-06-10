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
    const playerId = searchParams.get("player") || undefined;
    const role = searchParams.get("role") || undefined;
    const range = searchParams.get("range") || "all";
    const sessionLimit = range === "5" ? 5 : range === "10" ? 10 : 99999;
    const db = getDb();

    const { count: playerCount, error: pcError } = role != null
      ? await db.from("players").select("id", { count: "exact", head: true }).eq("role", role)
      : await db.from("players").select("id", { count: "exact", head: true });
    if (pcError) throw pcError;

    const { data: sessionsInScope, error: sessError } = await db
      .from("sessions")
      .select("id, date, focus")
      .order("date", { ascending: false })
      .limit(sessionLimit);
    if (sessError) throw sessError;
    const sessionList = sessionsInScope ?? [];
    const sessionCount = sessionList.length;
    const sessionIds = sessionList.map((s: any) => s.id);
    const dateBySession = new Map(sessionList.map((s: any) => [s.id, s.date]));

    if (sessionCount === 0) {
      return NextResponse.json({
        playerCount: playerCount ?? 0,
        sessionCount: 0,
        avgBatting: 0,
        strikeRate: 0,
        economy: 0,
        totalWickets: 0,
        wicketsPerSession: 0,
        recentSessions: [],
        topPerformers: [],
        performanceTrend: [],
        drillRatingTrend: [],
        sessionsByFocus: [],
        insight: "No sessions yet. Create a practice session to see KPIs and trends.",
      });
    }

    let statsQuery = db.from("performance_stats").select("*").in("session_id", sessionIds);
    if (playerId) statsQuery = statsQuery.eq("player_id", playerId);
    const { data: statsRows, error: statsError } = await statsQuery;
    if (statsError) throw statsError;
    const stats = statsRows ?? [];

    let totalRuns = 0, totalDismissals = 0, totalBalls = 0, totalOvers = 0, totalConceded = 0, totalWickets = 0;
    for (const s of stats) {
      totalRuns += Number(s.runs_scored ?? 0);
      totalDismissals += Number(s.dismissals ?? 0);
      totalBalls += Number(s.balls_faced ?? 0);
      totalOvers += Number(s.overs_bowled ?? 0);
      totalConceded += Number(s.runs_conceded ?? 0);
      totalWickets += Number(s.wickets ?? 0);
    }
    const avgBatting = totalDismissals > 0 ? Math.round((totalRuns / totalDismissals) * 100) / 100 : totalRuns;
    const strikeRate = totalBalls > 0 ? Math.round((totalRuns / totalBalls) * 100 * 100) / 100 : 0;
    const economy = totalOvers > 0 ? Math.round((totalConceded / totalOvers) * 100) / 100 : 0;
    const wicketsPerSession = sessionCount > 0 ? Math.round((totalWickets / sessionCount) * 10) / 10 : 0;

    const { data: recentSessions, error: recentErr } = await db
      .from("sessions")
      .select("id, date, focus, age_group, duration_minutes, num_players")
      .order("date", { ascending: false })
      .limit(5);
    if (recentErr) throw recentErr;

    const playerIds = [...new Set(stats.map((s: { player_id: string }) => s.player_id))];
    let playersList: { id: string; name: string; role: string }[] = [];
    if (playerIds.length > 0) {
      let q = db.from("players").select("id, name, role").in("id", playerIds);
      if (role) q = q.eq("role", role);
      const { data: pl } = await q;
      playersList = pl ?? [];
    }
    const byPlayer = new Map<string, { runs: number; dismissals: number; balls: number; wickets: number }>();
    for (const s of stats) {
      const cur = byPlayer.get(s.player_id) ?? { runs: 0, dismissals: 0, balls: 0, wickets: 0 };
      cur.runs += Number(s.runs_scored ?? 0);
      cur.dismissals += Number(s.dismissals ?? 0);
      cur.balls += Number(s.balls_faced ?? 0);
      cur.wickets += Number(s.wickets ?? 0);
      byPlayer.set(s.player_id, cur);
    }
    const topPerformers = playersList
      .map((p) => {
        const agg = byPlayer.get(p.id);
        if (!agg) return null;
        const avg_batting = agg.dismissals > 0 ? Math.round((agg.runs / agg.dismissals) * 100) / 100 : 0;
        const avg_strike_rate = agg.balls > 0 ? Math.round((agg.runs / agg.balls) * 100 * 100) / 100 : 0;
        return { id: p.id, name: p.name, role: p.role, avg_batting, avg_strike_rate, total_wickets: agg.wickets };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.avg_batting ?? 0) - (a?.avg_batting ?? 0))
      .slice(0, 5);

    const bySessionDate = new Map<string, { runs: number; dismissals: number; balls: number; overs: number; conceded: number }>();
    for (const s of stats) {
      const d = dateBySession.get(s.session_id);
      if (!d) continue;
      const key = typeof d === "string" ? d.slice(0, 10) : String(d);
      const cur = bySessionDate.get(key) ?? { runs: 0, dismissals: 0, balls: 0, overs: 0, conceded: 0 };
      cur.runs += Number(s.runs_scored ?? 0);
      cur.dismissals += Number(s.dismissals ?? 0);
      cur.balls += Number(s.balls_faced ?? 0);
      cur.overs += Number(s.overs_bowled ?? 0);
      cur.conceded += Number(s.runs_conceded ?? 0);
      bySessionDate.set(key, cur);
    }
    const performanceTrend = Array.from(bySessionDate.entries())
      .map(([session_date, cur]) => ({
        session_date,
        batting: cur.dismissals > 0 ? Math.round((cur.runs / cur.dismissals) * 100) / 100 : 0,
        strike_rate: cur.balls > 0 ? Math.round((cur.runs / cur.balls) * 100 * 100) / 100 : 0,
        economy: cur.overs > 0 ? Math.round((cur.conceded / cur.overs) * 100) / 100 : 0,
      }))
      .sort((a, b) => a.session_date.localeCompare(b.session_date));

    const { data: drillsData } = await db.from("drills").select("id, session_id").in("session_id", sessionIds);
    const drillIds = (drillsData ?? []).map((d: { id: string }) => d.id);
    const drillSessionById = new Map((drillsData ?? []).map((d: { id: string; session_id: string }) => [d.id, d.session_id]));
    let drillRatingTrend: { session_date: string; avg_rating: number }[] = [];
    if (drillIds.length > 0) {
      const { data: resData } = await db.from("drill_results").select("drill_id, rating_1_5").in("drill_id", drillIds);
      const results = resData ?? [];
      const byDate = new Map<string, number[]>();
      for (const r of results) {
        if (r.rating_1_5 == null) continue;
        const sid = drillSessionById.get(r.drill_id);
        if (!sid) continue;
        const d = dateBySession.get(sid);
        if (!d) continue;
        const key = typeof d === "string" ? d.slice(0, 10) : String(d);
        const arr = byDate.get(key) ?? [];
        arr.push(Number(r.rating_1_5));
        byDate.set(key, arr);
      }
      drillRatingTrend = Array.from(byDate.entries())
        .map(([session_date, arr]) => ({
          session_date,
          avg_rating: Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100,
        }))
        .sort((a, b) => a.session_date.localeCompare(b.session_date));
    }

    const focusCount = new Map<string, number>();
    for (const s of sessionList) {
      const f = s.focus ?? "batting";
      focusCount.set(f, (focusCount.get(f) ?? 0) + 1);
    }
    const sessionsByFocus = Array.from(focusCount.entries())
      .map(([focus, count]) => ({ focus, count }))
      .sort((a, b) => a.focus.localeCompare(b.focus));

    const trendRows = performanceTrend;
    const lastEconomy = trendRows.length >= 2 ? Number(trendRows[trendRows.length - 1]?.economy ?? 0) : 0;
    const prevEconomy = trendRows.length >= 2 ? Number(trendRows[trendRows.length - 2]?.economy ?? 0) : 0;
    const lastRating = drillRatingTrend.length >= 1 ? Number(drillRatingTrend[drillRatingTrend.length - 1]?.avg_rating ?? 0) : 0;
    const prevRating = drillRatingTrend.length >= 2 ? Number(drillRatingTrend[drillRatingTrend.length - 2]?.avg_rating ?? 0) : 0;

    let insight = "Review session data and drill ratings to adjust plans.";
    if (lastEconomy > 0 && prevEconomy > 0 && lastEconomy < prevEconomy) {
      insight = "Bowling economy is improving; maintain current plan.";
    } else if (lastRating >= 4 && lastRating > prevRating) {
      insight = "Drill ratings are strong and improving; keep the focus.";
    } else if (lastRating > 0 && lastRating < 3) {
      insight = "Consider more repetition or simpler progressions for low-rated drills.";
    }

    return NextResponse.json({
      playerCount: playerCount ?? 0,
      sessionCount,
      avgBatting,
      strikeRate,
      economy,
      totalWickets,
      wicketsPerSession,
      recentSessions: recentSessions ?? [],
      topPerformers,
      performanceTrend,
      drillRatingTrend,
      sessionsByFocus,
      insight,
    });
  } catch (error) {
    const err = error as { message?: string; details?: string; hint?: string };
    const detail = err?.message ?? (error instanceof Error ? error.message : String(error));
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", detail },
      { status: 500 }
    );
  }
}
