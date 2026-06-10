// app/api/import/pdf/route.ts
// POST: Upload a PDF scorecard, parse it, check for player conflicts, return preview data

import { NextResponse } from "next/server";
import { getDb, isSupabaseConfigured } from "@/lib/db";
import { parseScorecardText, getAllPlayerNames } from "@/lib/scorecard-parser";
import { findConflicts } from "@/lib/name-matcher";
import PDFParser from "pdf2json";

async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; num: number }[]> {
  return new Promise((resolve, reject) => {
    // Initialize PDFParser with 1 to indicate raw text extraction only
    const pdfParser = new PDFParser(null, 1);
    
    pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      // getRawTextContent() returns a string of the text.
      resolve([{ text: pdfParser.getRawTextContent(), num: 1 }]);
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured. See docs/SUPABASE_SETUP.md." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Upload a PDF file (form field: file)" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported for scorecard import" }, { status: 400 });
    }

    // Convert to buffer and extract text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pages: { text: string; num: number }[];
    try {
      pages = await extractTextFromPdf(buffer);
    } catch (parseErr) {
      console.error("PDF parse error:", parseErr);
      return NextResponse.json(
        { error: "Could not read the PDF. Make sure it is a valid, text-based scorecard PDF." },
        { status: 422 }
      );
    }

    // Parse the scorecard structure
    const scorecard = parseScorecardText(pages);

    if (!scorecard.team1 || !scorecard.team2) {
      return NextResponse.json(
        { error: "Could not detect two teams in this PDF. Make sure it is a full match scorecard." },
        { status: 422 }
      );
    }

    // Get all unique player names from the scorecard
    const pdfPlayerNames = getAllPlayerNames(scorecard);

    // Fetch all existing players from DB to check for conflicts
    const db = getDb();
    const { data: existingPlayers, error: fetchErr } = await db
      .from("players")
      .select("id, name");

    if (fetchErr) {
      return NextResponse.json({ error: "Failed to fetch existing players: " + fetchErr.message }, { status: 500 });
    }

    // Temporarily disabled fuzzy matching to skip duplicate names suggestion per user request
    const conflicts: any[] = [];

    return NextResponse.json({
      scorecard,
      pdfPlayerNames,
      conflicts,
      message: `Ready to import: ${scorecard.team1} vs ${scorecard.team2} with ${pdfPlayerNames.length} players.`,
    });
  } catch (error) {
    console.error("PDF import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF import failed" },
      { status: 500 }
    );
  }
}
