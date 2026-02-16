import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = getDb();
    if (!db) {
        return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Get Team Details
    const { data: team, error: teamError } = await db
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();

    if (teamError) {
        return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    // Get Squad (Players joined with team_squads)
    // We want to fetch the players that are in this team.
    // The query structure depends on how we joined them.
    // team_squads has team_id and player_id. We want the player details.

    const { data: squad, error: squadError } = await db
        .from("team_squads")
        .select(`
      player_id,
      players (
        *
      )
    `)
        .eq("team_id", id);

    if (squadError) {
        return NextResponse.json({ error: squadError.message }, { status: 500 });
    }

    // Flatten the structure for the frontend
    const formattedSquad = squad.map((item: any) => item.players);

    return NextResponse.json({
        ...team,
        squad: formattedSquad,
    });
}
