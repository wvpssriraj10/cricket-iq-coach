import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Cleaning up database...");

  // 1. Delete all matches (cascades to match_performances)
  const { error: matchesError } = await db.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (matchesError) console.error("Error deleting matches:", matchesError);
  else console.log("Deleted all matches.");

  // 2. Delete all teams (cascades to team_squads)
  const { error: teamsError } = await db.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (teamsError) console.error("Error deleting teams:", teamsError);
  else console.log("Deleted all teams.");

  // 3. Delete all players
  const { data: players, error: playersErr } = await db.from('players').select('id, name');
  if (playersErr) {
    console.error("Error fetching players:", playersErr);
  } else if (players && players.length > 0) {
    for (const p of players) {
      await db.from('players').delete().eq('id', p.id);
      console.log(`Deleted player: ${p.name}`);
    }
    console.log(`Deleted ${players.length} players.`);
  }
  console.log("Cleanup complete!");
}

run().catch(console.error);
