# Cricket IQ Coach

Internal tool for cricket academies and school/college teams. Coaches and players log practice sessions, drills, and stats; the app turns this into dashboards, insights, and educational modules.

**Track:** Data & Ops (with strong Engineering) — VIT-AP Prompt to Production.

---

## Features

- **Dashboard (Data & Ops)** — KPIs (batting average, strike rate, economy, wickets per session), trend charts, drill ratings over time, sessions by focus, rule-based insight text. Filters: player, role, time range (Last 5 / 10 / All).
- **Match Scenario Classroom** — Chasing/Defending, overs left, runs required, wickets, batter type (Aggressive/Anchor). Recommended approach + one MCQ quiz with feedback.
- **Field Placement Tutor** — Format (T20/ODI/Test), phase (Powerplay/Middle/Death), bowler type (Pace/Spin), batter style. Visual field with click-to-place and draggable fielders; “Suggest field” preset + short explanation.

---

## Tech stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Supabase (Postgres); `@supabase/supabase-js` with service role
- **Deploy:** Vercel

---

## Run locally

1. **Clone and install**
   ```bash
   cd "Prompt to Production VIT-AP (Cricket IQ Coach)"
   npm install
   ```

2. **Database (Supabase)**
   - Create a project at [supabase.com](https://supabase.com).
   - In **SQL Editor**, run the full script in `scripts/supabase-schema.sql` (tables + drill catalog seed).
   - Optionally run `scripts/setup-database.sql` for demo players/sessions/stats.

3. **Env**
   - Create `.env.local` in the project root (see `.env.example`).
   - Add (from Supabase **Settings → API**):
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```
   - Do not commit `.env.local`.

4. **Start**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, the Dashboard uses demo data until the DB is set up.

---

## Build

The app builds without `DATABASE_URL` (DB is lazy-initialized at request time). To verify:

```bash
npm run build
```

---

## Deploy on Vercel

1. **Repo**
   - Push the project to GitHub (or connect your repo in Vercel).

2. **Vercel**
   - [vercel.com](https://vercel.com) → New Project → Import the repo.
   - Framework: **Next.js** (auto-detected). Root: project folder if in a monorepo.

3. **Environment variables**
   - In the Vercel project: **Settings → Environment Variables**.
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (Settings → API).

4. **Database**
   - Run `scripts/supabase-schema.sql` once in the Supabase SQL Editor. Optionally run `scripts/setup-database.sql` for demo data.

5. **Deploy**
   - Deploy (or push to the linked branch). Vercel will build and run `next build` and serve the app.

---

## Project layout

| Path | Purpose |
|------|--------|
| `app/` | Pages (Dashboard, Scenarios, Field) + API routes |
| `components/` | UI (dashboard, scenarios, field, shared) |
| `lib/` | DB client (`db.ts`), Supabase client, utils |
| `scripts/supabase-schema.sql` | Schema + drill catalog seed (run once in Supabase) |
| `scripts/setup-database.sql` | Optional demo players/sessions/stats |
| `docs/ARCHITECTURE.md` | Architecture and file structure |
| `docs/SUPABASE_SETUP.md` | DB setup (Neon/Supabase) and quick fix for “Database not configured” |

---

## Track alignment

- **Data & Ops:** Dashboard automates reporting and surfaces insights (KPIs, charts, insight text).
