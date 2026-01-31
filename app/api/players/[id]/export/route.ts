import { getDb, isSupabaseConfigured } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
} from "docx";

type StatRow = {
  id: string;
  session_id: string;
  balls_faced: number | null;
  runs_scored: number | null;
  dismissals: number | null;
  overs_bowled: number | null;
  runs_conceded: number | null;
  wickets: number | null;
  created_at?: string;
};

type SessionRow = { id: string; date: string; focus: string; duration_minutes: number };
type DrillRow = { id: string; session_id: string; name: string; type: string; planned_duration_minutes: number };
type DrillResultRow = { id: string; drill_id: string; rating_1_5: number | null; notes: string | null };

const ROLE_LABELS: Record<string, string> = {
  batter: "Batter",
  bowler: "Bowler",
  allrounder: "All-rounder",
  keeper: "Keeper",
};
const FOCUS_LABELS: Record<string, string> = {
  batting: "Batting",
  bowling: "Bowling",
  fielding: "Fielding",
  fitness: "Fitness",
};

function p(text: string, opts?: { bold?: boolean; italics?: boolean }) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold, italics: opts?.italics })],
    spacing: { after: 100 },
  });
}

function h1(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
  });
}

function h2(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
  });
}

function h3(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 120, after: 80 },
  });
}

function tableWithBorders(header: string[], rows: string[][], colWidths?: number[]) {
  const w = colWidths ?? header.map(() => 100 / header.length);
  const headerRow = new TableRow({
    children: header.map((t, i) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })] })],
        width: { size: w[i] ?? 100 / header.length, type: WidthType.PERCENTAGE },
      })
    ),
  });
  const dataRows = rows.map((row) =>
    new TableRow({
      children: row.map((t, i) =>
        new TableCell({
          children: [new Paragraph(t)],
          width: { size: w[i] ?? 100 / header.length, type: WidthType.PERCENTAGE },
        })
      ),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: [headerRow, ...dataRows],
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const { id } = await context.params;
    const db = getDb();

    const { data: playerData, error: playerError } = await db
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (playerError || !playerData) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    const player = playerData as { name?: string; role?: string; age_group?: string };

    const { data: stats = [], error: statsError } = await db
      .from("performance_stats")
      .select("*")
      .eq("player_id", id)
      .order("created_at", { ascending: true });

    if (statsError) throw statsError;

    const sessionIds = [...new Set((stats as StatRow[]).map((s) => s.session_id))];
    let sessions: SessionRow[] = [];
    if (sessionIds.length > 0) {
      const { data: sessionsList = [] } = await db
        .from("sessions")
        .select("id, date, focus, duration_minutes")
        .in("id", sessionIds)
        .order("date", { ascending: true });
      sessions = sessionsList as SessionRow[];
    }

    const sessionMap = new Map(sessions.map((s) => [s.id, s]));
    let drills: DrillRow[] = [];
    let drillResults: DrillResultRow[] = [];
    if (sessionIds.length > 0) {
      const { data: drillsList = [] } = await db
        .from("drills")
        .select("id, session_id, name, type, planned_duration_minutes")
        .in("session_id", sessionIds);
      drills = drillsList as DrillRow[];
      const drillIds = drills.map((d) => d.id);
      if (drillIds.length > 0) {
        const { data: resultsList = [] } = await db
          .from("drill_results")
          .select("id, drill_id, rating_1_5, notes")
          .in("drill_id", drillIds);
        drillResults = resultsList as DrillResultRow[];
      }
    }

    const resultByDrillId = new Map(drillResults.map((r) => [r.drill_id, r]));
    const drillsBySessionId = new Map<string, DrillRow[]>();
    for (const d of drills) {
      const list = drillsBySessionId.get(d.session_id) ?? [];
      list.push(d);
      drillsBySessionId.set(d.session_id, list);
    }

    const name = String(player.name ?? "Player");
    const role = String(player.role ?? "");
    const ageGroup = String(player.age_group ?? "");
    const roleLabel = ROLE_LABELS[role] ?? role;

    const reportGenerated = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const reportTimestamp = new Date().toISOString();
    const startDate = sessions.length > 0 ? formatDate(sessions[0].date) : "—";
    const endDate = sessions.length > 0 ? formatDate(sessions[sessions.length - 1].date) : "—";
    const reportingPeriod = `${startDate} – ${endDate}`;
    const sessionCount = sessions.length;
    const focusSet = [...new Set(sessions.map((s) => s.focus))];
    const primaryFocusAreas = focusSet.map((f) => FOCUS_LABELS[f] ?? f).join(", ") || "—";

    const totalBalls = (stats as StatRow[]).reduce((a, s) => a + Number(s.balls_faced ?? 0), 0);
    const totalRuns = (stats as StatRow[]).reduce((a, s) => a + Number(s.runs_scored ?? 0), 0);
    const totalDismissals = (stats as StatRow[]).reduce((a, s) => a + Number(s.dismissals ?? 0), 0);
    const totalOvers = (stats as StatRow[]).reduce((a, s) => a + Number(s.overs_bowled ?? 0), 0);
    const totalRunsConceded = (stats as StatRow[]).reduce((a, s) => a + Number(s.runs_conceded ?? 0), 0);
    const totalWickets = (stats as StatRow[]).reduce((a, s) => a + Number(s.wickets ?? 0), 0);

    const battingAvg = totalDismissals > 0 ? (totalRuns / totalDismissals).toFixed(2) : "—";
    const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : "—";
    const economy = totalOvers > 0 ? (totalRunsConceded / totalOvers).toFixed(2) : "—";
    const wicketsPerSession = sessionCount > 0 ? (totalWickets / sessionCount).toFixed(2) : "—";
    const avgPerWicket = totalWickets > 0 ? (totalRunsConceded / totalWickets).toFixed(2) : "—";

    const ratings = drillResults.map((r) => r.rating_1_5).filter((r): r is number => r != null && r >= 1 && r <= 5);
    const overallRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";
    const fieldingDrills = drills.filter((d) => d.type === "fielding");
    const fieldingDrillIds = new Set(fieldingDrills.map((d) => d.id));
    const fieldingRatings = drillResults.filter((r) => fieldingDrillIds.has(r.drill_id)).map((r) => r.rating_1_5).filter((r): r is number => r != null);
    const fieldingAvgRating = fieldingRatings.length > 0 ? (fieldingRatings.reduce((a, b) => a + b, 0) / fieldingRatings.length).toFixed(1) : "—";

    const strikeRateNum = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;
    const battingApproach = strikeRateNum >= 120 ? "aggressive" : strikeRateNum >= 80 ? "balanced" : totalBalls > 0 ? "cautious" : "—";
    const economyNum = totalOvers > 0 ? totalRunsConceded / totalOvers : 0;
    const bowlingControl = economyNum > 0 && economyNum < 6 ? "excellent" : economyNum <= 8 ? "good" : totalOvers > 0 ? "needs improvement" : "—";

    const half = Math.floor(sessions.length / 2);
    const earlyStats = (stats as StatRow[]).slice(0, half);
    const recentStats = (stats as StatRow[]).slice(half);
    const earlyBalls = earlyStats.reduce((a, s) => a + Number(s.balls_faced ?? 0), 0);
    const earlyRuns = earlyStats.reduce((a, s) => a + Number(s.runs_scored ?? 0), 0);
    const recentBalls = recentStats.reduce((a, s) => a + Number(s.balls_faced ?? 0), 0);
    const recentRuns = recentStats.reduce((a, s) => a + Number(s.runs_scored ?? 0), 0);
    const earlySR = earlyBalls > 0 ? ((earlyRuns / earlyBalls) * 100).toFixed(2) : "—";
    const recentSR = recentBalls > 0 ? ((recentRuns / recentBalls) * 100).toFixed(2) : "—";
    const earlyOvers = earlyStats.reduce((a, s) => a + Number(s.overs_bowled ?? 0), 0);
    const earlyConceded = earlyStats.reduce((a, s) => a + Number(s.runs_conceded ?? 0), 0);
    const recentOvers = recentStats.reduce((a, s) => a + Number(s.overs_bowled ?? 0), 0);
    const recentConceded = recentStats.reduce((a, s) => a + Number(s.runs_conceded ?? 0), 0);
    const earlyEcon = earlyOvers > 0 ? (earlyConceded / earlyOvers).toFixed(2) : "—";
    const recentEcon = recentOvers > 0 ? (recentConceded / recentOvers).toFixed(2) : "—";
    const battingTrend = earlyBalls > 0 && recentBalls > 0 ? (Number(recentSR) >= Number(earlySR) ? "Improving" : "Declining") : "Stable";
    const bowlingTrend = earlyOvers > 0 && recentOvers > 0 ? (Number(recentEcon) <= Number(earlyEcon) ? "Improving" : "Declining") : "Stable";

    const earlyRatings = sessions.slice(0, half).flatMap((s) => (drillsBySessionId.get(s.id) ?? []).map((d) => resultByDrillId.get(d.id)?.rating_1_5).filter((r): r is number => r != null));
    const recentRatings = sessions.slice(half).flatMap((s) => (drillsBySessionId.get(s.id) ?? []).map((d) => resultByDrillId.get(d.id)?.rating_1_5).filter((r): r is number => r != null));
    const avgEarlyRating = earlyRatings.length > 0 ? (earlyRatings.reduce((a, b) => a + b, 0) / earlyRatings.length).toFixed(1) : "—";
    const avgRecentRating = recentRatings.length > 0 ? (recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length).toFixed(1) : "—";
    const drillTrend = avgEarlyRating !== "—" && avgRecentRating !== "—" ? (Number(avgRecentRating) >= Number(avgEarlyRating) ? "upward" : "downward") : "stable";
    const progressDesc = drillTrend === "upward" ? "positive progress" : drillTrend === "downward" ? "area for improvement" : "consistent effort";

    const hasBatting = totalBalls > 0 || totalRuns > 0 || totalDismissals > 0;
    const hasBowling = totalOvers > 0 || totalRunsConceded > 0 || totalWickets > 0;
    const hasFieldingRatings = fieldingRatings.length > 0;
    const hasDrillRatings = ratings.length > 0;
    const hasTrends = sessionCount >= 2;

    const children: (Paragraph | Table)[] = [];

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Player Performance Report", bold: true, size: 36 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    children.push(h2("Player & Report Info"));
    children.push(p(`Player Name: ${name}`));
    children.push(p(`Role: ${roleLabel}`));
    children.push(p(`Age Group: ${ageGroup}`));
    children.push(p(`Report Generated: ${reportGenerated}`));
    if (sessionCount > 0) {
      children.push(p(`Reporting Period: ${reportingPeriod}`));
      children.push(p(`Sessions in this period: ${sessionCount}`));
      children.push(p(`Focus areas: ${primaryFocusAreas}`));
    }
    if (hasDrillRatings) {
      children.push(p(`Overall drill rating (average): ${overallRating}/5.0`));
    }

    if (hasBatting) {
      children.push(h2("Batting"));
      const battingRows: string[][] = [
        ["Total Balls Faced", String(totalBalls)],
        ["Total Runs Scored", String(totalRuns)],
        ["Dismissals", String(totalDismissals)],
        ["Batting Average", String(battingAvg)],
        ["Strike Rate", `${strikeRate}%`],
      ];
      children.push(tableWithBorders(["Metric", "Value"], battingRows, [60, 40]));
      children.push(new Paragraph({ spacing: { after: 120 } }));
      if (totalBalls > 0 && battingApproach !== "—") {
        children.push(p(`Strike rate of ${strikeRate}% indicates a ${battingApproach} approach at the crease.`));
      }
    }

    if (hasBowling) {
      children.push(h2("Bowling"));
      const bowlingRows: string[][] = [
        ["Total Overs Bowled", totalOvers.toFixed(1)],
        ["Runs Conceded", String(totalRunsConceded)],
        ["Wickets Taken", String(totalWickets)],
        ["Bowling Economy", String(economy)],
        ["Wickets per Session", String(wicketsPerSession)],
        ["Average per Wicket", String(avgPerWicket)],
      ];
      children.push(tableWithBorders(["Metric", "Value"], bowlingRows, [60, 40]));
      children.push(new Paragraph({ spacing: { after: 120 } }));
      if (bowlingControl !== "—") {
        children.push(p(`Economy of ${economy} demonstrates ${bowlingControl} control and consistency.`));
      }
    }

    if (hasFieldingRatings) {
      children.push(h2("Fielding"));
      children.push(p(`Fielding drills average rating: ${fieldingAvgRating}/5.0 (from ${fieldingRatings.length} drill(s)).`));
    }

    if (sessions.length > 0) {
      children.push(h2("Session-by-Session"));
      sessions.forEach((session, idx) => {
        const sessionStats = (stats as StatRow[]).find((s) => s.session_id === session.id);
        const sessionDrills = drillsBySessionId.get(session.id) ?? [];
        children.push(h3(`${formatDate(session.date)} – ${FOCUS_LABELS[session.focus] ?? session.focus}`));
        children.push(p(`Duration: ${session.duration_minutes} minutes`));
        if (sessionDrills.length > 0) {
          children.push(p("Drills:"));
          sessionDrills.forEach((drill) => {
            const res = resultByDrillId.get(drill.id);
            const ratingStr = res?.rating_1_5 != null ? ` – ${res.rating_1_5}/5` : "";
            const notesStr = res?.notes?.trim() ? ` – ${res.notes}` : "";
            children.push(p(`• ${drill.name} (${drill.planned_duration_minutes} min)${ratingStr}${notesStr}`));
          });
        }
        const hasSessionBatting = sessionStats && (sessionStats.balls_faced != null || sessionStats.runs_scored != null || sessionStats.dismissals != null);
        const hasSessionBowling = sessionStats && (sessionStats.overs_bowled != null || sessionStats.runs_conceded != null || sessionStats.wickets != null);
        if (hasSessionBatting || hasSessionBowling) {
          const parts: string[] = [];
          if (sessionStats?.balls_faced != null) parts.push(`Balls: ${sessionStats.balls_faced}`);
          if (sessionStats?.runs_scored != null) parts.push(`Runs: ${sessionStats.runs_scored}`);
          if (sessionStats?.dismissals != null) parts.push(`Dismissals: ${sessionStats.dismissals}`);
          if (sessionStats?.overs_bowled != null) parts.push(`Overs: ${sessionStats.overs_bowled}`);
          if (sessionStats?.wickets != null) parts.push(`Wickets: ${sessionStats.wickets}`);
          if (sessionStats?.runs_conceded != null) parts.push(`Runs conceded: ${sessionStats.runs_conceded}`);
          if (parts.length > 0) children.push(p(`Session stats: ${parts.join("; ")}`));
        }
        children.push(new Paragraph({ spacing: { after: 140 } }));
      });
    }

    if (hasTrends && (hasBatting || hasBowling || hasDrillRatings)) {
      children.push(h2("Trends"));
      if (hasDrillRatings && avgEarlyRating !== "—" && avgRecentRating !== "—") {
        children.push(p(`Drill ratings: ${drillTrend} (early avg ${avgEarlyRating}/5, recent ${avgRecentRating}/5 – ${progressDesc}).`));
      }
      if (hasBatting && earlyBalls > 0 && recentBalls > 0) {
        children.push(p(`Batting: strike rate ${earlySR} → ${recentSR} (${battingTrend}).`));
      }
      if (hasBowling && earlyOvers > 0 && recentOvers > 0) {
        children.push(p(`Bowling: economy ${earlyEcon} → ${recentEcon} (${bowlingTrend}).`));
      }
    }

    children.push(h2("Summary"));
    const summaryParts: string[] = [];
    summaryParts.push(`${name} (${roleLabel}, ${ageGroup})`);
    if (sessionCount === 0) {
      summaryParts.push("has no session data recorded yet.");
    } else {
      summaryParts.push(`took part in ${sessionCount} session(s) between ${startDate} and ${endDate}.`);
      if (primaryFocusAreas !== "—") summaryParts.push(`Focus areas: ${primaryFocusAreas}.`);
      if (hasBatting) {
        summaryParts.push(`Batting: ${totalRuns} runs off ${totalBalls} balls (strike rate ${strikeRate}%)${totalDismissals > 0 ? `, average ${battingAvg}` : ""}.`);
      }
      if (hasBowling) {
        summaryParts.push(`Bowling: ${totalOvers.toFixed(1)} overs, ${totalWickets} wickets, economy ${economy}.`);
      }
      if (hasDrillRatings) {
        summaryParts.push(`Drill ratings averaged ${overallRating}/5${hasTrends && drillTrend !== "stable" ? ` with ${drillTrend} trend` : ""}.`);
      }
      if (hasFieldingRatings) {
        summaryParts.push(`Fielding drill average: ${fieldingAvgRating}/5.`);
      }
    }
    children.push(p(summaryParts.join(" ")));
    if (sessionCount > 0 && (hasBatting || hasBowling)) {
      const takeaway: string[] = [];
      if (hasBatting && battingApproach !== "—") takeaway.push(`Batting approach: ${battingApproach}.`);
      if (hasBowling && bowlingControl !== "—") takeaway.push(`Bowling: ${bowlingControl} control.`);
      if (hasTrends) {
        if (battingTrend !== "Stable" && hasBatting) takeaway.push(`Batting trend: ${battingTrend}.`);
        if (bowlingTrend !== "Stable" && hasBowling) takeaway.push(`Bowling trend: ${bowlingTrend}.`);
      }
      if (takeaway.length > 0) {
        children.push(p(takeaway.join(" ")));
      }
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Report generated by Cricket IQ Coach. ", italics: true })],
        spacing: { before: 240, after: 100 },
      })
    );
    children.push(p(`Generated: ${reportTimestamp}`));

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeName = name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "player";
    const filename = `${safeName}_performance_report.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (error) {
    console.error("Error exporting player progress:", error);
    return NextResponse.json(
      { error: "Failed to export progress" },
      { status: 500 }
    );
  }
}
