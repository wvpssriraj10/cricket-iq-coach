-- Run this to reset the testing data from the broken imports

-- 1. Delete all matches, performances, teams, and team_squads
TRUNCATE TABLE match_performances CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE team_squads CASCADE;
TRUNCATE TABLE teams CASCADE;

-- 2. Clean up the garbage players created by the old parser
-- This deletes players with long stats or dismissal text in their names
DELETE FROM players 
WHERE name ILIKE '%out%' 
   OR name ILIKE '% b %' 
   OR name ILIKE '% c %' 
   OR LENGTH(name) > 30
   OR name ~ '\d+\.\d+\s+\d+'; -- matches '2.2 0' or '4 0 54'

-- If you want to delete ALL players and start completely fresh, uncomment the line below:
-- TRUNCATE TABLE players CASCADE;
