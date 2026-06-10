# Supabase Setup (Cricket IQ Coach)

The app uses **Supabase** (Postgres) with `@supabase/supabase-js`. API routes use the **service role** key (server-only).

---

## Quick fix: "Supabase not configured or unreachable"

1. **Create `.env.local`** in the project root (copy from `.env.example`).
2. **Supabase project:** [supabase.com](https://supabase.com) → Create project → open it.
3. **Settings → API:** copy **Project URL** and **service_role** key (secret).
4. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   Do not commit `.env.local`.
5. **SQL Editor:** New query → paste the full contents of `scripts/supabase-schema.sql` → **Run** (creates tables + seed drill catalog).
6. **If you already had the schema:** Run `scripts/add-player-profile-columns.sql` once to add batting_arm, bowling_arm, bowler_type, preferred_batting_position, preferred_bowling_phase to `players`.
7. **Optional seed data:** For demo players/sessions/stats, run `scripts/setup-database.sql` in the same SQL Editor (or skip and create sessions via the app).
8. **Restart dev server:** `npm run dev`.

After that, **Create Session** on the Practice Planner should work.

---

## Schema (scripts/supabase-schema.sql)

Minimal but solid schema for Data & Ops dashboard and future features:

- **drill_catalog** – predefined drills (batting, bowling, fielding, fitness); seeded in script.
- **players** – id (UUID), name, role (batter/bowler/allrounder/keeper), age_group.
- **sessions** – id (UUID), date, focus, age_group, duration_minutes, num_players, notes.
- **drills** – id (UUID), session_id (FK), name, type, planned_duration_minutes, coaching_tip.
- **drill_results** – id (UUID), drill_id (FK), rating_1_5 (1–5), notes; UNIQUE(drill_id).
- **performance_stats** – id (UUID), player_id (FK), session_id (FK), balls_faced, runs_scored, dismissals, overs_bowled, runs_conceded, wickets.

---

## Row Level Security (optional)

When you add authentication, you can enable RLS and policies. The app currently uses the **service_role** key, which bypasses RLS. To enable RLS later:

1. In Supabase SQL Editor:
   ```sql
   ALTER TABLE players ENABLE ROW LEVEL SECURITY;
   ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
   -- ... same for drills, drill_results, performance_stats
   ```
2. Add policies per table (e.g. allow authenticated users to read/write their org’s data).
3. Use **anon** key + JWT for client requests, or keep **service_role** for server-only admin.

---

## Vercel

In the Vercel project → **Settings → Environment Variables**, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Then run `scripts/supabase-schema.sql` once in the Supabase SQL Editor (same project). Deploy.
