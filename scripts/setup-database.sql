-- Cricket IQ Coach Database Schema
-- Supabase / Neon / Postgres: run once in SQL Editor (see docs/SUPABASE_SETUP.md).

-- Drill catalog table (predefined drills for selection)
CREATE TABLE IF NOT EXISTS drill_catalog (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('batting', 'bowling', 'fielding', 'fitness')),
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  description TEXT,
  coaching_tip TEXT
);

-- Seed drill catalog
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
  ('Stretching Routine', 'fitness', 10, 'Flexibility and warm-up', 'Hold each stretch for 30 seconds')
ON CONFLICT DO NOTHING;

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('batter', 'bowler', 'allrounder', 'keeper')),
  age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('U12', 'U16', 'U19', 'College')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
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

-- Add notes column if it doesn't exist (for existing databases)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drills table
CREATE TABLE IF NOT EXISTS drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('batting', 'bowling', 'fielding', 'fitness')),
  planned_duration_minutes INTEGER NOT NULL,
  coaching_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drill results table
CREATE TABLE IF NOT EXISTS drill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_id UUID NOT NULL REFERENCES drills(id) ON DELETE CASCADE,
  rating_1_5 INTEGER CHECK (rating_1_5 >= 1 AND rating_1_5 <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drill_id)
);

-- Performance stats table
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

-- Seed some demo players
INSERT INTO players (name, role, age_group) VALUES
  ('Rahul Sharma', 'batter', 'U19'),
  ('Priya Patel', 'bowler', 'U19'),
  ('Arjun Singh', 'allrounder', 'U16'),
  ('Sneha Gupta', 'keeper', 'U16'),
  ('Vikram Kumar', 'batter', 'College'),
  ('Ananya Reddy', 'bowler', 'College'),
  ('Dev Malhotra', 'allrounder', 'U19'),
  ('Kavya Nair', 'batter', 'U12')
ON CONFLICT DO NOTHING;

-- Seed some demo sessions with drills
DO $$
DECLARE
  session_id_1 UUID;
  session_id_2 UUID;
  session_id_3 UUID;
  session_id_4 UUID;
  session_id_5 UUID;
  drill_id UUID;
  player_rec RECORD;
BEGIN
  -- Session 1: Batting focus
  INSERT INTO sessions (date, focus, age_group, duration_minutes, num_players)
  VALUES (NOW() - INTERVAL '4 days', 'batting', 'U19', 90, 4)
  RETURNING id INTO session_id_1;
  
  INSERT INTO drills (session_id, name, type, planned_duration_minutes, coaching_tip)
  VALUES 
    (session_id_1, 'Front Foot Drive Practice', 'batting', 20, 'Focus on getting the front foot to the pitch of the ball'),
    (session_id_1, 'Pull Shot Technique', 'batting', 20, 'Keep eyes on the ball, roll wrists on contact'),
    (session_id_1, 'Running Between Wickets', 'batting', 15, 'Call early, run the first one hard'),
    (session_id_1, 'Throwdown Session', 'batting', 25, 'Simulate match conditions with variable pace');

  -- Add ratings for session 1 drills
  FOR drill_id IN SELECT id FROM drills WHERE session_id = session_id_1
  LOOP
    INSERT INTO drill_results (drill_id, rating_1_5, notes)
    VALUES (drill_id, 3 + floor(random() * 2)::int, 'Good effort from the team');
  END LOOP;

  -- Session 2: Bowling focus
  INSERT INTO sessions (date, focus, age_group, duration_minutes, num_players)
  VALUES (NOW() - INTERVAL '3 days', 'bowling', 'U19', 75, 3)
  RETURNING id INTO session_id_2;
  
  INSERT INTO drills (session_id, name, type, planned_duration_minutes, coaching_tip)
  VALUES 
    (session_id_2, 'Line and Length Bowling', 'bowling', 20, 'Hit the same spot 10 times in a row'),
    (session_id_2, 'Yorker Practice', 'bowling', 20, 'Aim for the base of the stumps'),
    (session_id_2, 'Variation Bowling', 'bowling', 20, 'Work on slower balls and cutters');

  FOR drill_id IN SELECT id FROM drills WHERE session_id = session_id_2
  LOOP
    INSERT INTO drill_results (drill_id, rating_1_5, notes)
    VALUES (drill_id, 3 + floor(random() * 3)::int, 'Improvement seen in accuracy');
  END LOOP;

  -- Session 3: Fielding focus
  INSERT INTO sessions (date, focus, age_group, duration_minutes, num_players)
  VALUES (NOW() - INTERVAL '2 days', 'fielding', 'U16', 60, 6)
  RETURNING id INTO session_id_3;
  
  INSERT INTO drills (session_id, name, type, planned_duration_minutes, coaching_tip)
  VALUES 
    (session_id_3, 'Catching High Balls', 'fielding', 15, 'Get under the ball early, soft hands'),
    (session_id_3, 'Ground Fielding', 'fielding', 15, 'Attack the ball, stay low'),
    (session_id_3, 'Throwing Accuracy', 'fielding', 15, 'Side on, follow through to target'),
    (session_id_3, 'Relay Throws', 'fielding', 15, 'Quick release, flat trajectory');

  FOR drill_id IN SELECT id FROM drills WHERE session_id = session_id_3
  LOOP
    INSERT INTO drill_results (drill_id, rating_1_5, notes)
    VALUES (drill_id, 2 + floor(random() * 3)::int, 'Need more work on diving catches');
  END LOOP;

  -- Session 4: Fitness focus
  INSERT INTO sessions (date, focus, age_group, duration_minutes, num_players)
  VALUES (NOW() - INTERVAL '1 day', 'fitness', 'College', 45, 8)
  RETURNING id INTO session_id_4;
  
  INSERT INTO drills (session_id, name, type, planned_duration_minutes, coaching_tip)
  VALUES 
    (session_id_4, 'Sprint Intervals', 'fitness', 15, 'Explosive start, maintain form'),
    (session_id_4, 'Agility Ladder', 'fitness', 15, 'Quick feet, stay light on toes'),
    (session_id_4, 'Core Strength Circuit', 'fitness', 15, 'Engage core throughout');

  FOR drill_id IN SELECT id FROM drills WHERE session_id = session_id_4
  LOOP
    INSERT INTO drill_results (drill_id, rating_1_5, notes)
    VALUES (drill_id, 4 + floor(random() * 2)::int, 'Great energy from the squad');
  END LOOP;

  -- Session 5: Batting focus (most recent)
  INSERT INTO sessions (date, focus, age_group, duration_minutes, num_players)
  VALUES (NOW(), 'batting', 'U16', 90, 5)
  RETURNING id INTO session_id_5;
  
  INSERT INTO drills (session_id, name, type, planned_duration_minutes, coaching_tip)
  VALUES 
    (session_id_5, 'Net Practice', 'batting', 30, 'Treat every ball like a match situation'),
    (session_id_5, 'Sweep Shot Drill', 'batting', 20, 'Get down early, watch the ball onto the bat'),
    (session_id_5, 'Power Hitting', 'batting', 25, 'Full swing, clear the front leg');

  FOR drill_id IN SELECT id FROM drills WHERE session_id = session_id_5
  LOOP
    INSERT INTO drill_results (drill_id, rating_1_5, notes)
    VALUES (drill_id, 3 + floor(random() * 2)::int, 'Solid session overall');
  END LOOP;

  -- Add performance stats for players across sessions
  FOR player_rec IN SELECT id, role FROM players LIMIT 6
  LOOP
    -- Add batting stats for batters and allrounders
    IF player_rec.role IN ('batter', 'allrounder', 'keeper') THEN
      INSERT INTO performance_stats (player_id, session_id, balls_faced, runs_scored, dismissals)
      VALUES 
        (player_rec.id, session_id_1, 30 + floor(random() * 20)::int, 20 + floor(random() * 30)::int, floor(random() * 2)::int),
        (player_rec.id, session_id_5, 25 + floor(random() * 25)::int, 15 + floor(random() * 35)::int, floor(random() * 3)::int);
    END IF;
    
    -- Add bowling stats for bowlers and allrounders
    IF player_rec.role IN ('bowler', 'allrounder') THEN
      INSERT INTO performance_stats (player_id, session_id, overs_bowled, runs_conceded, wickets)
      VALUES 
        (player_rec.id, session_id_2, 4 + floor(random() * 4)::decimal, 20 + floor(random() * 20)::int, floor(random() * 4)::int);
    END IF;
  END LOOP;
END $$;
