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
        const teamId = searchParams.get("teamId");

        if (!teamId) {
            return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
        }

        const db = getDb();
        const { data, error } = await db
            .from("matches")
            .select("*")
            .eq("team_id", teamId)
            .order("date", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching matches:", error);
        return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
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
        const { team_id, date, opponent, venue, result, extras } = body;

        if (!team_id || !date || !opponent) {
            return NextResponse.json(
                { error: "Team ID, Date, and Opponent are required" },
                { status: 400 }
            );
        }

        const db = getDb();
        const { data, error } = await db
            .from("matches")
            .insert({
                team_id,
                date: new Date(date).toISOString(),
                opponent,
                venue,
                result,
                extras: extras || 0
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating match:", error);
        return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
    }
}
