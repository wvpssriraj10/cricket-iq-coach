import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client with service role (bypasses RLS).
 * Use in API routes only. Lazy-initialized so build works without env.
 */

// Helper to make system fields optional in inserts
type DbInsert<T> = Omit<T, "id" | "created_at"> & { id?: string; created_at?: string };

export type Database = {
  public: {
    Tables: {
      players: {
        Row: Player;
        Insert: DbInsert<Player>;
        Update: Partial<DbInsert<Player>>;
      };
      sessions: {
        Row: Session;
        Insert: DbInsert<Session>;
        Update: Partial<DbInsert<Session>>;
      };
      drills: {
        Row: Drill;
        Insert: DbInsert<Drill>;
        Update: Partial<DbInsert<Drill>>;
      };
      drill_results: {
        Row: DrillResult;
        Insert: DbInsert<DrillResult>;
        Update: Partial<DbInsert<DrillResult>>;
      };
      performance_stats: {
        Row: PerformanceStats;
        Insert: DbInsert<PerformanceStats>;
        Update: Partial<DbInsert<PerformanceStats>>;
      };
      teams: {
        Row: Team;
        Insert: DbInsert<Team>;
        Update: Partial<DbInsert<Team>>;
      };
      team_squads: {
        Row: TeamSquad;
        Insert: DbInsert<TeamSquad>;
        Update: Partial<DbInsert<TeamSquad>>;
      };
      tournament_performances: {
        Row: TournamentPerformance;
        Insert: DbInsert<TournamentPerformance>;
        Update: Partial<DbInsert<TournamentPerformance>>;
      };
      matches: {
        Row: Match;
        Insert: DbInsert<Match>;
        Update: Partial<DbInsert<Match>>;
      };
      match_performances: {
        Row: MatchPerformance;
        Insert: DbInsert<MatchPerformance>;
        Update: Partial<DbInsert<MatchPerformance>>;
      };
    };
  };
};

// ... existing code ...

export type Match = {
  id: string;
  team_id: string;
  date: string;
  opponent: string;
  venue: string | null;
  result: "Win" | "Loss" | "Draw" | "Tie" | "No Result" | null;
  extras: number;
  created_at?: string;
};

export type MatchPerformance = {
  id: string;
  match_id: string;
  player_id: string;
  runs_scored: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  wickets: number;
  overs_bowled: number;
  runs_conceded: number;
  maidens: number;
  catches: number;
  stumpings: number;
  is_captain: boolean;
  is_wicketkeeper: boolean;
  created_at?: string;
};

// Fallback to any to avoid strict type errors with missing Supabase definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;

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

export type Team = {
  id: string;
  name: string;
  created_at?: string;
};

export type TeamSquad = {
  id: string;
  team_id: string;
  player_id: string;
  created_at?: string;
};

export type TournamentPerformance = {
  id: string;
  player_id: string;
  tournament_name: string;
  matches: number;
  runs: number;
  wickets: number;
  catches: number;
  stumpings: number;
  fifty: number;
  hundred: number;
  top_score: number;
  best_bowling: string;
  created_at?: string;
};
