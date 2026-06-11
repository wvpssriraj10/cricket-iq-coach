import { getDb } from "./lib/db";

async function run() {
    const db = getDb();
    
    const { data: matches } = await db.from("matches").select("*");
    console.log("MATCHES:");
    console.log(JSON.stringify(matches, null, 2));

    const { data: perfs } = await db.from("match_performances").select("*, players(name)");
    console.log("\nPERFORMANCES (Overs > 0 or Runs > 0):");
    const filtered = perfs?.filter((p: any) => p.overs_bowled > 0 || p.runs_scored > 0) || [];
    for (const p of filtered) {
       console.log(`Player: ${p.players?.name} | Match: ${p.match_id} | Bat: ${p.runs_scored}(${p.balls_faced}) | Bowl: ${p.overs_bowled}O ${p.wickets}W ${p.runs_conceded}R`);
    }
}
run();
