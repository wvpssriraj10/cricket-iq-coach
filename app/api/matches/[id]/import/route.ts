import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Ensure this route runs in a full Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper to sanitize text
function cleanText(text: string) {
    return text.replace(/\s+/g, " ").trim();
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;

    // In production (Vercel), disable server-side PDF parsing to
    // avoid pdf.js DOM/canvas polyfill issues during build.
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "PDF import is currently disabled in production. Please use the app in development mode for PDF uploads." },
            { status: 503 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Dynamically import pdf-parse only in non-production environments.
        const { default: pdfParse } = await import("pdf-parse" as any);
        const pdfData = await pdfParse(buffer as any);
        const text = (pdfData as any).text as string;

        // Parse extracted text to find performances
        // Strategy: Look for lines that look like player stats
        // This is a heuristic based on Cricheroes format specific observations
        const lines = text
            .split("\n")
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0);

        const extractedPerformances: { raw: string; name: string; stats: number[] }[] = [];

        // Match Squad to extract player IDs if possible?
        // For now, we return names and raw stats, frontend can match them.

        /* 
           Regex strategies for Cricheroes (approximate):
           Batting: "(Name) (Runs) (Balls) ..."
           Bowling: "(Name) (O) (M) (R) (W) ..."
        */

        // Simple extraction: look for lines with alphabets followed by numbers
        for (const line of lines) {
            // Check for Bowling-like pattern: Name followed by O M R W (e.g. "Bowler 4 0 25 1")
            // Or Batting: Name Runs Balls (e.g. "Batter 50 30")

            // Regex for a line containing Name followed by numbers.
            // Improved strategy: 
            // 1. Optional leading index (1, 2, 3...)
            // 2. Name (string)
            // 3. Stats (numbers)

            // Capture group 1: Name
            // Capture groups 2+: Stats

            // Example: "6 Surya 2 0 1" -> Name: Surya, Stats: 2, 0, 1
            // Example: "Surya 2 0 1" -> Name: Surya, Stats: 2, 0, 1

            const statsMatch = line.match(/^(?:\d+\s+)?([a-zA-Z\s]+)\s+(\d+)\s+(\d+)\s+(\d+)\s*(\d*)\s*(\d*\.?\d*)/);

            if (statsMatch) {
                const name: string = statsMatch[1].trim();
                const nums: number[] = statsMatch.slice(2).map((n: string | undefined) => n ? parseFloat(n) : 0);

                // Heuristic to distinguish Batting vs Bowling?
                // Bowling usually has Overs (can be 4.0), M, R, W. 
                // Batting has R, B, 4s, 6s, SR.

                // If we see a float like 3.5 or 4.0 in the first number, likely overs -> Bowling?
                // Or if we check the headers?

                // For this MVP import, we will extract raw data and let the user decide / map strings.
                // We'll return a list of "Candidates".

                if (name.length > 2) {
                    extractedPerformances.push({
                        raw: line,
                        name: name,
                        stats: nums
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: extractedPerformances,
            rawText: text // Debugging aid
        });

    } catch (error: any) {
        console.error("PDF Import Workflow Error:", error);
        return NextResponse.json({ error: `Failed to parse PDF: ${error.message}` }, { status: 500 });
    }
}
