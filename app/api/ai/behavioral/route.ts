/**
 * Behavioral Intelligence Layer — ingestion only.
 * Logs events; no write to production DB. Enable via NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED.
 * Rollback: disable flag; this route can remain (no-op if no client sends).
 */

import { NextResponse } from "next/server";

type Body = { events?: Array<Record<string, unknown>> };

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body;
    const events = body?.events ?? [];
    if (events.length === 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const timestamp = new Date().toISOString();
    for (const e of events) {
      console.info("[AI behavioral]", timestamp, JSON.stringify(e));
    }
    return NextResponse.json({ ok: true, received: events.length }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
