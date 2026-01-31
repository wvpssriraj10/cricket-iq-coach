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
    const { data: drills } = await db
      .from("drills")
      .select("id")
      .eq("session_id", sessionId);
    const drillIds = (drills ?? []).map((d: { id: string }) => d.id);
    if (drillIds.length === 0) return NextResponse.json([]);

    const { data, error } = await db
      .from("drill_results")
      .select("id, drill_id, rating_1_5, notes")
      .in("drill_id", drillIds);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching drill results:", error);
    return NextResponse.json(
      { error: "Failed to fetch drill results" },
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
    const { drill_id, rating_1_5, notes } = body;

    if (!drill_id) {
      return NextResponse.json(
        { error: "drill_id is required" },
        { status: 400 }
      );
    }

    const rating = rating_1_5 != null ? Number(rating_1_5) : null;
    if (rating != null && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "rating_1_5 must be between 1 and 5" },
        { status: 400 }
      );
    }

    const db = getDb();
    const { data, error } = await db
      .from("drill_results")
      .upsert(
        {
          drill_id,
          rating_1_5: rating,
          notes: notes ?? null,
        },
        { onConflict: "drill_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error saving drill result:", error);
    return NextResponse.json(
      { error: "Failed to save drill result" },
      { status: 500 }
    );
  }
}
