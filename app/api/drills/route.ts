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
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }
    const db = getDb();
    const { data, error } = await db
      .from("drills")
      .select("id, session_id, name, type, planned_duration_minutes, coaching_tip")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching drills:", error);
    return NextResponse.json(
      { error: "Failed to fetch drills" },
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
    const { session_id, name, type, planned_duration_minutes, coaching_tip } = body;

    if (!session_id || !name || !type) {
      return NextResponse.json(
        { error: "session_id, name, and type are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const duration = Number(planned_duration_minutes) ?? 15;
    const { data, error } = await db
      .from("drills")
      .insert({
        session_id,
        name: String(name).trim(),
        type: type ?? "batting",
        planned_duration_minutes: duration > 0 ? duration : 15,
        coaching_tip: coaching_tip ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating drill:", error);
    return NextResponse.json(
      { error: "Failed to create drill" },
      { status: 500 }
    );
  }
}
