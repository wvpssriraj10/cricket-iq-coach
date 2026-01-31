/**
 * Conversational interface — guide-only. No irreversible actions.
 * Stub: returns a safe, contextual hint. Replace with AI/LLM when ready.
 * Enable via NEXT_PUBLIC_AI_CHAT_ENABLED. Rollback: disable flag.
 */

import { NextResponse } from "next/server";

type Body = { message?: string; pathname?: string };

const PATH_HINTS: Record<string, string> = {
  "/players": "Use the Add player form on this page, or filter by role/age at the top. Use Log and Download on each row for performance.",
  "/sessions": "Create a session with the form, then use Record performance to link a player and add stats.",
  "/practice": "Schedule a practice, then add drills from the catalog or create custom ones.",
  "/import": "Upload a .xlsx, .csv, or .json file with the required columns. See the Required columns card for format.",
  "/dashboard": "The dashboard shows KPIs and charts. Use filters to narrow by player, role, or time range.",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body;
    const pathname = body?.pathname ?? "";
    const hint = PATH_HINTS[pathname];
    const reply = hint ?? "Use the sidebar to go to Players, Sessions, Practice, or Dashboard. I can only guide — use the app to perform actions.";
    return NextResponse.json({ reply }, { status: 200 });
  } catch {
    return NextResponse.json(
      { reply: "I couldn't process that. Please try again." },
      { status: 500 }
    );
  }
}
