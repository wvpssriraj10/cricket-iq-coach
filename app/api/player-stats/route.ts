import { getDb, isSupabaseConfigured } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json(
            { error: "Supabase not configured" },
            { status: 503 }
        );
    }
    try {
        const { searchParams } = new URL(request.url);
        const playerId = searchParams.get("playerId");

        if (!playerId) {
            return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
        }

        const db = getDb();

        // Fetch all match performances for the player
        const { data: perfs, error } = await db
            .from("match_performances")
            .select("*")
            .eq("player_id", playerId);

        if (error) throw error;

        if (!perfs || perfs.length === 0) {
            return NextResponse.json({
                matches: 0,
                runs: 0,
                wickets: 0,
                batting_avg: 0,
                strike_rate: 0,
                economy: 0,
                bowling_avg: 0,
                highest_score: 0,
                best_bowling: "0/0"
            });
        }

        // Calculate aggregates
        let totalRuns = 0;
        let totalBalls = 0;
        let totalOuts = 0; // Need to know if out/not out, butschema doesn't have 'is_not_out'. Assuming all innings are outs for now or we update schema?
        // User request "GIVE ME A OPTION TO ADD PER MATCH PERFORMANCE" - usually implies basic scorecard.
        // For accurate Average, we strictly need 'Not Out' flag.
        // I'll assume 'dismissals' field in performance stats might be relevant? 
        // Wait, match_performances schema has 'runs_scored', 'wickets' (taken). 
        // It does NOT have 'is_out'.
        // Limitation: We will calculate average as Runs / Matches for now, or just Total Runs if we can't determine outs.
        // Actually, standard is usually Runs / Innings. I'll treat every entry as an innings.

        // Re-checking schema:
        // match_performances: runs_scored, balls_faced, fours, sixes, wickets, overs_bowled, runs_conceded...

        // I will use Matches as denominator for Average for now, acknowledging it's technically "Runs per Innings".

        let totalWicketsTaken = 0;
        let totalRunsConceded = 0;
        let totalOversBowled = 0;
        let highestScore = 0;
        let bestBowlingWickets = 0;
        let bestBowlingRuns = Infinity;

        for (const p of perfs) {
            const r = Number(p.runs_scored) || 0;
            const b = Number(p.balls_faced) || 0;
            const w = Number(p.wickets) || 0;
            const rc = Number(p.runs_conceded) || 0;
            const o = Number(p.overs_bowled) || 0;

            totalRuns += r;
            totalBalls += b;

            if (r > highestScore) highestScore = r;

            // Bowling stats
            totalWicketsTaken += w;
            totalRunsConceded += rc;

            // Check if overs is number, handle 3.2 (3 overs 2 balls)
            // Convert to total balls
            const overPart = Math.floor(o);
            const ballPart = Math.round((o - overPart) * 10);
            totalOversBowled += (overPart * 6) + ballPart; // Store as balls for now

            // Best bowling: Most wickets, then least runs
            if (w > bestBowlingWickets) {
                bestBowlingWickets = w;
                bestBowlingRuns = rc;
            } else if (w === bestBowlingWickets) {
                if (rc < bestBowlingRuns) {
                    bestBowlingRuns = rc;
                }
            }
        }

        // Batting Avg = Total Run / Innings (Matches here)
        const matches = perfs.length;
        const battingAvg = matches > 0 ? (totalRuns / matches).toFixed(2) : 0;

        // SR = (Runs / Balls) * 100
        const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : 0;

        // Convert total balls bowled back to overs for economy calc
        // Economy = Runs / Overs
        const totalOvers = totalOversBowled / 6;
        const economy = totalOvers > 0 ? (totalRunsConceded / totalOvers).toFixed(2) : 0;

        // Bowling Avg = Runs Conceded / Wickets
        const bowlingAvg = totalWicketsTaken > 0 ? (totalRunsConceded / totalWicketsTaken).toFixed(2) : 0;

        const stats = {
            matches,
            runs: totalRuns,
            wickets: totalWicketsTaken,
            batting_avg: battingAvg,
            strike_rate: strikeRate,
            economy: economy,
            bowling_avg: bowlingAvg,
            highest_score: highestScore,
            best_bowling: totalWicketsTaken > 0 || bestBowlingRuns < Infinity ? `${bestBowlingWickets}/${bestBowlingRuns}` : "-"
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error calculating player stats:", error);
        return NextResponse.json({ error: "Failed to calculate stats" }, { status: 500 });
    }
}
