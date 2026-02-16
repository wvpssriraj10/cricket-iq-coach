-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team_squads table (junction table for Team <-> Player)
CREATE TABLE IF NOT EXISTS team_squads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, player_id)
);

-- Create tournament_performances table
CREATE TABLE IF NOT EXISTS tournament_performances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  tournament_name TEXT NOT NULL,
  matches INTEGER DEFAULT 0,
  runs INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  catches INTEGER DEFAULT 0,
  stumpings INTEGER DEFAULT 0,
  fifty INTEGER DEFAULT 0,
  hundred INTEGER DEFAULT 0,
  top_score INTEGER DEFAULT 0,
  best_bowling TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add useful indexes
CREATE INDEX IF NOT EXISTS idx_team_squads_team_id ON team_squads(team_id);
CREATE INDEX IF NOT EXISTS idx_team_squads_player_id ON team_squads(player_id);
CREATE INDEX IF NOT EXISTS idx_tournament_performances_player_id ON tournament_performances(player_id);

-- Add policies (Optional: If RLS is enabled on other tables, you might want to enable it here too)
-- For now, we follow the pattern of the existing setup which relies on service_role for admin tasks
-- but if you want to enable public read access:

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_performances ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public)
CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to team_squads" ON team_squads FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tournament_performances" ON tournament_performances FOR SELECT USING (true);

-- Allow insert/update/delete only to authenticated users (or service role)
-- Assuming the app might use service key for these operations as per docs, but adding auth policies just in case
CREATE POLICY "Allow authenticated insert to teams" ON teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to team_squads" ON team_squads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to tournament_performances" ON tournament_performances FOR INSERT TO authenticated WITH CHECK (true);
