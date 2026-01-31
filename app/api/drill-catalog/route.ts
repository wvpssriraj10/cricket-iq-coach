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
      .from("drill_catalog")
      .select("id, name, type, duration_minutes, description, coaching_tip")
      .order("type", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching drill catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch drill catalog" },
      { status: 500 }
    );
  }
}
