// app/api/import/pdf/confirm/route.ts
// POST: After user resolves all conflicts, save everything to DB

import { NextResponse } from "next/server";
import { getDb, isSupabaseConfigured } from "@/lib/db";
import { normalizeName } from "@/lib/name-matcher";
import type { ParsedScorecard } from "@/lib/scorecard-parser";

export type ConflictResolution = {
  pdfName: string;
  /** If merging, the ID of the existing player. If creating new, this is null/undefined. */
  mergeWithPlayerId?: string | null;
};

export type ConfirmImportBody = {
  scorecard: ParsedScorecard;
  resolutions: ConflictResolution[];
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }

  try {
    const body: ConfirmImportBody = await request.json();
    const { scorecard, resolutions } = body;

    if (!scorecard || !scorecard.team1 || !scorecard.team2) {
      return NextResponse.json({ error: "Invalid scorecard data" }, { status: 400 });
    }

    const db = getDb();

    // Build resolution map: pdfName → existing player ID (or null = create new)
    const resolutionMap = new Map<string, string | null>();
    for (const r of resolutions ?? []) {
      resolutionMap.set(normalizeName(r.pdfName), r.mergeWithPlayerId ?? null);
    }

    // Fetch all existing players for exact-name matching
    const { data: allPlayers } = await db.from("players").select("id, name");
    const existingByNorm = new Map<string, string>();
    for (const p of allPlayers ?? []) {
      existingByNorm.set(normalizeName(p.name), p.id);
    }

    const created = { teams: 0, players: 0, matches: 0, performances: 0 };

    // ── Upsert teams ────────────────────────────────────────────────────────────
    async function getOrCreateTeam(name: string): Promise<string> {
      const { data: existing } = await db
        .from("teams")
        .select("id")
        .ilike("name", name)
        .limit(1)
        .maybeSingle();
      if (existing?.id) return existing.id;

      const { data: inserted, error } = await db
        .from("teams")
        .insert({ name })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to create team "${name}": ${error.message}`);
      created.teams++;
      return inserted.id;
    }

    const team1Id = await getOrCreateTeam(scorecard.team1);
    const team2Id = await getOrCreateTeam(scorecard.team2);

    // ── Resolve player IDs ────────────────────────────────────────────────────
    const playerIdByName = new Map<string, string>();

    async function getOrCreatePlayer(pdfName: string, teamRole: "batter" | "bowler" | "allrounder" = "allrounder"): Promise<string> {
      const norm = normalizeName(pdfName);

      // Already resolved
      if (playerIdByName.has(norm)) return playerIdByName.get(norm)!;

      // Check if user said merge with existing
      if (resolutionMap.has(norm)) {
        const mergeId = resolutionMap.get(norm);
        if (mergeId) {
          playerIdByName.set(norm, mergeId);
          return mergeId;
        }
      }

      // Exact match in DB
      if (existingByNorm.has(norm)) {
        const id = existingByNorm.get(norm)!;
        playerIdByName.set(norm, id);
        return id;
      }

      // Create new player
      const { data: inserted, error } = await db
        .from("players")
        .insert({ name: pdfName, role: teamRole, age_group: "College" })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to create player "${pdfName}": ${error.message}`);
      created.players++;
      playerIdByName.set(norm, inserted.id);
      existingByNorm.set(norm, inserted.id);
      return inserted.id;
    }

    // Add all squad members
    const allSquadNames = [...scorecard.squad1, ...scorecard.squad2].map(p => p.name);
    // Also collect all names from innings
    for (const inn of scorecard.innings) {
      inn.batting.forEach((b) => allSquadNames.push(b.name));
      inn.bowling.forEach((b) => allSquadNames.push(b.name));
    }
    const uniqueSquadNames = Array.from(new Set(allSquadNames.map((n) => n.trim()).filter(Boolean)));

    for (const name of uniqueSquadNames) {
      await getOrCreatePlayer(name);
    }

    // ── Link players to teams via team_squads ─────────────────────────────────
    async function addToSquad(playerId: string, teamId: string) {
      const { data: existing } = await db
        .from("team_squads")
        .select("id")
        .eq("team_id", teamId)
        .eq("player_id", playerId)
        .limit(1)
        .maybeSingle();
      if (existing) return;
      await db.from("team_squads").insert({ team_id: teamId, player_id: playerId });
    }

    // Determine squad for each team. innings[0] batting → team1 batted, innings[1] batting → team2 batted
    const team1PlayerNames = new Set<string>([
      ...scorecard.squad1.map(p => p.name),
      ...(scorecard.innings[0]?.batting.map((b) => b.name) ?? []),
      ...(scorecard.innings[1]?.bowling.map((b) => b.name) ?? []),
    ]);
    const team2PlayerNames = new Set<string>([
      ...scorecard.squad2.map(p => p.name),
      ...(scorecard.innings[1]?.batting.map((b) => b.name) ?? []),
      ...(scorecard.innings[0]?.bowling.map((b) => b.name) ?? []),
    ]);

    for (const name of team1PlayerNames) {
      const id = playerIdByName.get(normalizeName(name));
      if (id) await addToSquad(id, team1Id);
    }
    for (const name of team2PlayerNames) {
      const id = playerIdByName.get(normalizeName(name));
      if (id) await addToSquad(id, team2Id);
    }

    // ── Create match records (one per team) ───────────────────────────────────
    const matchDate = scorecard.matchDate
      ? new Date(scorecard.matchDate).toISOString()
      : new Date().toISOString();

    async function getOrCreateMatch(teamId: string, opponentName: string, result: string | null): Promise<string> {
      // Check if match already exists (same team + date + opponent)
      const { data: existing } = await db
        .from("matches")
        .select("id")
        .eq("team_id", teamId)
        .eq("opponent", opponentName)
        .gte("date", matchDate.substring(0, 10) + "T00:00:00.000Z")
        .lte("date", matchDate.substring(0, 10) + "T23:59:59.999Z")
        .limit(1)
        .maybeSingle();
      if (existing?.id) return existing.id;

      const { data: inserted, error } = await db
        .from("matches")
        .insert({
          team_id: teamId,
          date: matchDate,
          opponent: opponentName,
          venue: scorecard.venue,
          result,
          extras: scorecard.innings.find((i) => i.teamName === (teamId === team1Id ? scorecard.team1 : scorecard.team2))?.extras ?? 0,
        })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to create match: ${error.message}`);
      created.matches++;
      return inserted.id;
    }

    // Determine result from each team's perspective
    const team1Result = scorecard.result ?? null;
    const team2Result = scorecard.result
      ? scorecard.result.includes(scorecard.team1)
        ? scorecard.result.replace(scorecard.team1, scorecard.team2) // rough flip
        : scorecard.result
      : null;

    const match1Id = await getOrCreateMatch(team1Id, scorecard.team2, team1Result);
    const match2Id = await getOrCreateMatch(team2Id, scorecard.team1, team2Result);

    // ── Insert match_performances ──────────────────────────────────────────────
    // innings[0] = team1 batting innings, innings[1] = team2 batting innings
    const inn1 = scorecard.innings[0]; // team1 batted
    const inn2 = scorecard.innings[1]; // team2 batted

    async function insertPerformance(
      matchId: string,
      playerName: string,
      batting: { runs: number; balls: number; fours: number; sixes: number } | null,
      bowling: { overs: number; runs: number; wickets: number; maidens: number } | null,
      isCaptain: boolean,
      isWk: boolean
    ) {
      const norm = normalizeName(playerName);
      const playerId = playerIdByName.get(norm);
      if (!playerId) return;

      // Check for existing performance
      const { data: existing } = await db
        .from("match_performances")
        .select("id")
        .eq("match_id", matchId)
        .eq("player_id", playerId)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const updates: any = {};
        if (batting) {
          updates.runs_scored = batting.runs;
          updates.balls_faced = batting.balls;
          updates.fours = batting.fours;
          updates.sixes = batting.sixes;
        }
        if (bowling) {
          updates.wickets = bowling.wickets;
          updates.overs_bowled = bowling.overs;
          updates.runs_conceded = bowling.runs;
          updates.maidens = bowling.maidens;
        }
        await db.from("match_performances").update(updates).eq("id", existing.id);
        return;
      }

      const { error } = await db.from("match_performances").insert({
        match_id: matchId,
        player_id: playerId,
        runs_scored: batting?.runs ?? 0,
        balls_faced: batting?.balls ?? 0,
        fours: batting?.fours ?? 0,
        sixes: batting?.sixes ?? 0,
        wickets: bowling?.wickets ?? 0,
        overs_bowled: bowling?.overs ?? 0,
        runs_conceded: bowling?.runs ?? 0,
        maidens: bowling?.maidens ?? 0,
        catches: 0,
        stumpings: 0,
        is_captain: isCaptain,
        is_wicketkeeper: isWk,
      });
      if (!error) created.performances++;
    }

    // Process innings 1 (team1 batting, team2 bowling)
    const fullSquadMap = new Map<string, { isCaptain: boolean; isWicketKeeper: boolean }>();
    [...scorecard.squad1, ...scorecard.squad2].forEach(p => {
      fullSquadMap.set(p.name, { isCaptain: p.isCaptain, isWicketKeeper: p.isWicketKeeper });
    });

    function getFlags(name: string) {
       return fullSquadMap.get(name) || { isCaptain: false, isWicketKeeper: false };
    }

    if (inn1) {
      for (const batter of inn1.batting) {
        const flags = getFlags(batter.name);
        await insertPerformance(match1Id, batter.name, batter, null, flags.isCaptain, flags.isWicketKeeper);
      }
      for (const bowler of inn1.bowling) {
        const flags = getFlags(bowler.name);
        await insertPerformance(match2Id, bowler.name, null, bowler, flags.isCaptain, flags.isWicketKeeper);
      }
    }

    // Process innings 2 (team2 batting, team1 bowling)
    if (inn2) {
      for (const batter of inn2.batting) {
        const flags = getFlags(batter.name);
        await insertPerformance(match2Id, batter.name, batter, null, flags.isCaptain, flags.isWicketKeeper);
      }
      for (const bowler of inn2.bowling) {
        const flags = getFlags(bowler.name);
        await insertPerformance(match1Id, bowler.name, null, bowler, flags.isCaptain, flags.isWicketKeeper);
      }
    }

    return NextResponse.json({
      created,
      team1: { id: team1Id, name: scorecard.team1 },
      team2: { id: team2Id, name: scorecard.team2 },
      message: `Successfully imported: ${scorecard.team1} vs ${scorecard.team2}. Created ${created.teams} team(s), ${created.players} player(s), ${created.matches} match record(s), ${created.performances} performance record(s).`,
    });
  } catch (error) {
    console.error("PDF confirm import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import confirmation failed" },
      { status: 500 }
    );
  }
}
