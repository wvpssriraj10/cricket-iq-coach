import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
    const db = getDb();
    if (!db) {
        return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    try {
        const json = await request.json();
        const {
            player_id,
            tournament_name,
            matches,
            runs,
            wickets,
            catches,
            stumpings,
            fifty,
            hundred,
            top_score,
            best_bowling
        } = json;

        if (!player_id || !tournament_name) {
            return NextResponse.json({ error: "Player ID and Tournament Name are required" }, { status: 400 });
        }

        const { data, error } = await db
            .from("tournament_performances")
            .insert({
                player_id,
                tournament_name,
                matches: matches || 0,
                runs: runs || 0,
                wickets: wickets || 0,
                catches: catches || 0,
                stumpings: stumpings || 0,
                fifty: fifty || 0,
                hundred: hundred || 0,
                top_score: top_score || 0,
                best_bowling: best_bowling || ""
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
