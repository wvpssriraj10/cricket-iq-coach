import { getDb, isSupabaseConfigured } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const db = getDb();
    const { data, error } = await db
      .from("sessions")
      .select("id, date, focus, age_group, duration_minutes, num_players")
      .order("date", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
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
    const { date, focus, age_group, duration_minutes, num_players, notes } = body;

    if (!date || !focus) {
      return NextResponse.json(
        { error: "date and focus are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const { data, error } = await db
      .from("sessions")
      .insert({
        date: new Date(date).toISOString(),
        focus: focus ?? "batting",
        age_group: age_group ?? "U19",
        duration_minutes: Number(duration_minutes) ?? 60,
        num_players: Number(num_players) ?? 1,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
