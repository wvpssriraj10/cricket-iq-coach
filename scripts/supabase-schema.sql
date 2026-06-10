-- Cricket IQ Coach – Supabase schema (run once in Supabase SQL Editor)
-- Data & Ops: players, sessions, drills, drill_results, performance_stats feed Dashboard KPIs and charts.
-- App uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (see docs/SUPABASE_SETUP.md).

-- Drill catalog
CREATE TABLE IF NOT EXISTS drill_catalog (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('batting', 'bowling', 'fielding', 'fitness')),
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  description TEXT,
  coaching_tip TEXT
);

-- Seed drill catalog (batting, bowling, fielding, fitness)
INSERT INTO drill_catalog (name, type, duration_minutes, description, coaching_tip) VALUES
  ('Front Foot Drive', 'batting', 20, 'Practice driving on the front foot to pitched up deliveries', 'Get front foot to the pitch of the ball'),
  ('Pull Shot Technique', 'batting', 20, 'Work on pulling short pitched deliveries', 'Keep eyes on the ball, roll wrists on contact'),
  ('Net Practice', 'batting', 30, 'Simulated match batting in nets', 'Treat every ball like a match situation'),
  ('Sweep Shot Drill', 'batting', 20, 'Practice sweep shots against spin', 'Get down early, watch the ball onto the bat'),
  ('Power Hitting', 'batting', 25, 'Practice clearing the boundary', 'Full swing, clear the front leg'),
  ('Running Between Wickets', 'batting', 15, 'Quick singles and twos practice', 'Call early, run the first one hard'),
  ('Line and Length', 'bowling', 20, 'Consistent line and length bowling', 'Hit the same spot 10 times in a row'),
  ('Yorker Practice', 'bowling', 20, 'Death bowling yorkers', 'Aim for the base of the stumps'),
  ('Variation Bowling', 'bowling', 20, 'Slower balls and cutters', 'Disguise the variations'),
  ('Spin Bowling', 'bowling', 25, 'Flight and turn practice', 'Use your fingers, not your wrist'),
  ('Bouncer Practice', 'bowling', 15, 'Short pitched bowling', 'Target the shoulder height'),
  ('Catching High Balls', 'fielding', 15, 'Outfield catching practice', 'Get under the ball early, soft hands'),
  ('Ground Fielding', 'fielding', 15, 'Stopping and collecting', 'Attack the ball, stay low'),
  ('Throwing Accuracy', 'fielding', 15, 'Direct hit practice', 'Side on, follow through to target'),
  ('Relay Throws', 'fielding', 15, 'Outfield relay practice', 'Quick release, flat trajectory'),
  ('Slip Catching', 'fielding', 20, 'Close catching drills', 'Soft hands, watch it in'),
  ('Sprint Intervals', 'fitness', 15, 'Speed and acceleration work', 'Explosive start, maintain form'),
  ('Agility Ladder', 'fitness', 15, 'Footwork and coordination', 'Quick feet, stay light on toes'),
  ('Core Strength Circuit', 'fitness', 15, 'Core stability exercises', 'Engage core throughout'),
  ('Endurance Run', 'fitness', 20, 'Cardio endurance building', 'Maintain steady pace'),
  ('Stretching Routine', 'fitness', 10, 'Flexibility and warm-up', 'Hold each stretch for 30 seconds');
-- Run once; re-run will duplicate rows unless you truncate drill_catalog first.

-- Players (profile columns: run scripts/add-player-profile-columns.sql on existing DBs)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('batter', 'bowler', 'allrounder', 'keeper')),
  age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('U12', 'U16', 'U19', 'College')),
  batting_arm VARCHAR(10) CHECK (batting_arm IN ('left', 'right')),
  bowling_arm VARCHAR(10) CHECK (bowling_arm IN ('left', 'right')),
  bowler_type VARCHAR(50),
  preferred_batting_position VARCHAR(30),
  preferred_bowling_phase VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  focus VARCHAR(20) NOT NULL CHECK (focus IN ('batting', 'bowling', 'fielding', 'fitness')),
  age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('U12', 'U13', 'U15', 'U16', 'U17', 'U19', 'College', 'Senior')),
  duration_minutes INTEGER NOT NULL,
  num_players INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drills
CREATE TABLE IF NOT EXISTS drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('batting', 'bowling', 'fielding', 'fitness')),
  planned_duration_minutes INTEGER NOT NULL,
  coaching_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drill results (one row per drill: rating 1–5 + notes)
CREATE TABLE IF NOT EXISTS drill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_id UUID NOT NULL REFERENCES drills(id) ON DELETE CASCADE,
  rating_1_5 INTEGER CHECK (rating_1_5 >= 1 AND rating_1_5 <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drill_id)
);

-- Performance stats
CREATE TABLE IF NOT EXISTS performance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  balls_faced INTEGER,
  runs_scored INTEGER,
  dismissals INTEGER,
  overs_bowled DECIMAL(4,1),
  runs_conceded INTEGER,
  wickets INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Row Level Security (enable when you add auth)
-- ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drill_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE performance_stats ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow service role full access" ON players FOR ALL USING (true);
-- (repeat for other tables, or use service_role key which bypasses RLS)
