import { getDb, isSupabaseConfigured } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json(
            { error: "Supabase not configured" },
            { status: 503 }
        );
    }
    try {
        const { id: matchId } = await context.params;
        const db = getDb();

        // Fetch performances joined with player details for names
        const { data, error } = await db
            .from("match_performances")
            .select(`
        *,
        players (
          id,
          name,
          role
        )
      `)
            .eq("match_id", matchId);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching match performances:", error);
        return NextResponse.json({ error: "Failed to fetch performances" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }
    try {
        const { id: matchId } = await context.params;
        const body = await request.json();

        // Body should be an array of performance objects or a single object
        const performances = Array.isArray(body) ? body : [body];

        if (performances.length === 0) {
            return NextResponse.json({ message: "No data to save" });
        }

        const db = getDb();

        // Prepare data for upsert
        // We assume the frontend sends complete objects for the dirty rows
        const rowsToUpsert = performances.map(p => ({
            match_id: matchId,
            player_id: p.player_id,
            runs_scored: p.runs_scored || 0,
            balls_faced: p.balls_faced || 0,
            fours: p.fours || 0,
            sixes: p.sixes || 0,
            wickets: p.wickets || 0,
            overs_bowled: p.overs_bowled || 0,
            runs_conceded: p.runs_conceded || 0,
            maidens: p.maidens || 0,
            catches: p.catches || 0,
            stumpings: p.stumpings || 0,
            is_captain: p.is_captain || false,
            is_wicketkeeper: p.is_wicketkeeper || false
        }));

        const { data, error } = await db
            .from("match_performances")
            .upsert(rowsToUpsert, { onConflict: "match_id,player_id" })
            .select();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error saving match performances:", error);
        return NextResponse.json({ error: "Failed to save performances" }, { status: 500 });
    }
}
