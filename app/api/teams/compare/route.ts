import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const team1Id = searchParams.get("team1Id");
    const team2Id = searchParams.get("team2Id");

    if (!team1Id || !team2Id) {
        return NextResponse.json({ error: "Both team1Id and team2Id are required" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
        return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    async function getTeamStats(teamId: string) {
        // 1. Get Squad
        const { data: squad, error: squadError } = await db
            .from("team_squads")
            .select("player_id")
            .eq("team_id", teamId);

        if (squadError) return { error: squadError.message };
        if (!squad || squad.length === 0) return { stats: null, playerCount: 0 };

        const playerIds = squad.map((s: any) => s.player_id);

        // 2. Get Performances for these players
        const { data: performances, error: perfError } = await db
            .from("tournament_performances")
            .select("*")
            .in("player_id", playerIds);

        if (perfError) return { error: perfError.message };

        // 3. Aggregate Stats
        const stats = performances.reduce(
            (acc: any, curr: any) => {
                acc.total_runs += curr.runs || 0;
                acc.total_wickets += curr.wickets || 0;
                acc.total_matches += curr.matches || 0;
                acc.total_catches += curr.catches || 0;
                acc.total_stumpings += curr.stumpings || 0;
                acc.centuries += curr.hundred || 0;
                acc.half_centuries += curr.fifty || 0;

                // Simple aggregate for top scores logic (sum of top scores isn't meaningful, but maybe max is)
                if (curr.top_score > acc.highest_score) acc.highest_score = curr.top_score;
                return acc;
            },
            {
                total_runs: 0,
                total_wickets: 0,
                total_matches: 0,
                total_catches: 0,
                total_stumpings: 0,
                centuries: 0,
                half_centuries: 0,
                highest_score: 0,
            }
        );

        return { stats, playerCount: playerIds.length, performanceCount: performances.length };
    }

    const [team1Stats, team2Stats] = await Promise.all([
        getTeamStats(team1Id),
        getTeamStats(team2Id),
    ]);

    if (team1Stats.error || team2Stats.error) {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    // Get Team Names
    const { data: teamsData } = await db.from('teams').select('id, name').in('id', [team1Id, team2Id]);
    const team1Name = teamsData?.find((t: any) => t.id === team1Id)?.name || "Team 1";
    const team2Name = teamsData?.find((t: any) => t.id === team2Id)?.name || "Team 2";

    return NextResponse.json({
        team1: {
            id: team1Id,
            name: team1Name,
            ...team1Stats
        },
        team2: {
            id: team2Id,
            name: team2Name,
            ...team2Stats
        }
    });
}
