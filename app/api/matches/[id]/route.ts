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

    try {
        const { data: match, error } = await db
            .from("matches")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!match) {
            return NextResponse.json({ error: "Match not found" }, { status: 404 });
        }

        return NextResponse.json(match);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
    }
}
