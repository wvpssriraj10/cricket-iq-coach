import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: teamId } = await params;
    const db = getDb();
    if (!db) {
        return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    try {
        const json = await request.json();
        const { name, role, batting_arm, bowling_arm, bowler_type, existing_player_id } = json;

        let playerId = existing_player_id;

        // If no existing player ID designated, create a new player or check if exists by name (simplification)
        // For this feature, we'll assume we are creating a new player profile if one isn't selected from a list.
        // Ideally, we'd search for existing players, but requirement implies adding specific details.

        if (!playerId) {
            if (!name || !role) {
                return NextResponse.json({ error: "Name and Role are required for new players" }, { status: 400 });
            }

            // Defaulting age_group to U19 if not provided, as 'Senior' is not in the allowed list
            const validAgeGroup = json.age_group || "U19";

            const { data: newPlayer, error: createError } = await db
                .from("players")
                .insert({
                    name,
                    role,
                    batting_arm,
                    bowling_arm,
                    bowler_type,
                    age_group: validAgeGroup
                })
                .select()
                .single();

            if (createError) {
                return NextResponse.json({ error: createError.message }, { status: 500 });
            }
            playerId = newPlayer.id;
        }

        // Add to Team Squad
        const { error: squadError } = await db
            .from("team_squads")
            .insert({
                team_id: teamId,
                player_id: playerId
            });

        if (squadError) {
            // Ignore duplicate key error if player already in team
            if (squadError.code !== '23505') {
                return NextResponse.json({ error: squadError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, playerId });
    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
