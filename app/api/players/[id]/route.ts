import { getDb, isSupabaseConfigured } from "@/lib/db";
import { NextResponse } from "next/server";

const ALLOWED_PROFILE_KEYS = [
  "batting_arm",
  "bowling_arm",
  "bowler_type",
  "preferred_batting_position",
  "preferred_bowling_phase",
] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updates: Record<string, string | null> = {};
    for (const key of ALLOWED_PROFILE_KEYS) {
      if (key in body) {
        const v = body[key];
        updates[key] = v === "" || v == null ? null : String(v).trim();
      }
    }
    if (updates.batting_arm && !["left", "right"].includes(updates.batting_arm)) {
      updates.batting_arm = null;
    }
    if (updates.bowling_arm && !["left", "right"].includes(updates.bowling_arm)) {
      updates.bowling_arm = null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid profile fields to update" },
        { status: 400 }
      );
    }

    const db = getDb();
    const { data, error } = await db
      .from("players")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }
  try {
    const { id } = await context.params;
    const db = getDb();
    const { data: existing } = await db.from("players").select("id").eq("id", id).maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    const { error } = await db.from("players").delete().eq("id", id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 }
    );
  }
}
