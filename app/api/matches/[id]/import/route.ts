import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PDFParse } from "pdf-parse";

// Helper to sanitize text
function cleanText(text: string) {
    return text.replace(/\s+/g, " ").trim();
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: matchId } = await params;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Parse PDF
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        const text = pdfData.text;

        // Parse extracted text to find performances
        // Strategy: Look for lines that look like player stats
        // This is a heuristic based on Cricheroes format specific observations
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

        const extractedPerformances: any[] = [];

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

            // Regex for a line starting with text (Name) and ending with numbers
            // Note: Names can have spaces.

            // Example: "Surya 2 0 1" -> Name: Surya, Runs: 2, Balls: 0, 4s: 1?
            // Let's try to capture: Name (capture group 1), then sequence of numbers.
            const statsMatch = line.match(/^([a-zA-Z\s]+)\s+(\d+)\s+(\d+)\s+(\d+)\s*(\d*)\s*(\d*\.?\d*)/);

            if (statsMatch) {
                const name = statsMatch[1].trim();
                const nums = statsMatch.slice(2).map(n => n ? parseFloat(n) : 0);

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

    } catch (error) {
        console.error("PDF Import Error:", error);
        return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
    }
}
