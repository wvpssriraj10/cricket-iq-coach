-- Add player profile columns (batting/bowling arm, bowler type, batting position, bowling phase)
-- Run once in Supabase SQL Editor after supabase-schema.sql (see docs/SUPABASE_SETUP.md).

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS batting_arm VARCHAR(10) CHECK (batting_arm IN ('left', 'right')),
  ADD COLUMN IF NOT EXISTS bowling_arm VARCHAR(10) CHECK (bowling_arm IN ('left', 'right')),
  ADD COLUMN IF NOT EXISTS bowler_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS preferred_batting_position VARCHAR(30),
  ADD COLUMN IF NOT EXISTS preferred_bowling_phase VARCHAR(30);

COMMENT ON COLUMN players.batting_arm IS 'Left or right arm batsman';
COMMENT ON COLUMN players.bowling_arm IS 'Left or right arm bowler';
COMMENT ON COLUMN players.bowler_type IS 'e.g. Fast, Medium, Spin, Left-arm orthodox';
COMMENT ON COLUMN players.preferred_batting_position IS 'e.g. 1-7, Opener, Middle order';
COMMENT ON COLUMN players.preferred_bowling_phase IS 'e.g. Powerplay, Middle overs, Death';
