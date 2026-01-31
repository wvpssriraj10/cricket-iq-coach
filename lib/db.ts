import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client with service role (bypasses RLS).
 * Use in API routes only. Lazy-initialized so build works without env.
 */
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. See docs/SUPABASE_SETUP.md."
      );
    }
    _supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabase;
}

/** Returns true if Supabase env vars are set (so API can use DB). */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

/** Call in API routes: const db = getSupabase(); db.from('players').select()... */
export { getSupabase as getDb };

// Re-export types for API and components
export type Player = {
  id: string;
  name: string;
  role: "batter" | "bowler" | "allrounder" | "keeper";
  age_group: string;
  batting_arm?: "left" | "right" | null;
  bowling_arm?: "left" | "right" | null;
  bowler_type?: string | null;
  preferred_batting_position?: string | null;
  preferred_bowling_phase?: string | null;
  created_at?: string;
};

export type Session = {
  id: string;
  date: string;
  focus: "batting" | "bowling" | "fielding" | "fitness";
  age_group: string;
  duration_minutes: number;
  num_players: number;
  notes?: string | null;
  created_at?: string;
};

export type Drill = {
  id: string;
  session_id: string;
  name: string;
  type: string;
  planned_duration_minutes: number;
  coaching_tip: string | null;
  created_at?: string;
};

export type DrillResult = {
  id: string;
  drill_id: string;
  rating_1_5: number | null;
  notes: string | null;
  created_at?: string;
};

export type PerformanceStats = {
  id: string;
  player_id: string;
  session_id: string;
  balls_faced: number | null;
  runs_scored: number | null;
  dismissals: number | null;
  overs_bowled: number | null;
  runs_conceded: number | null;
  wickets: number | null;
  created_at?: string;
};
