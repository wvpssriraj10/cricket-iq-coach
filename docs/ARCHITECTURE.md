# Cricket IQ Coach – Architecture & File Structure

**Track:** Data & Ops (with strong Engineering).  
**Stack:** Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres) → Vercel.

---

## 1. Folder Structure (App Router)

```
app/
├── layout.tsx              # Root layout, fonts, metadata
├── page.tsx                # Dashboard (Data & Ops entry)
├── globals.css
├── scenarios/
│   └── page.tsx            # Match Scenario Classroom (front-end only)
├── field/
│   └── page.tsx            # Field Placement Tutor (front-end only)
└── api/
    ├── dashboard/
    │   └── route.ts        # KPIs, charts, insights (filtered)
    ├── players/
    │   └── route.ts        # GET list (for dashboard filter), POST create
    └── stats/
        └── route.ts        # Aggregated stats for dashboard filters

components/
├── app-shell.tsx           # Layout wrapper (sidebar + main)
├── app-sidebar.tsx         # Nav: Dashboard, Scenarios, Field
├── dashboard-content.tsx   # KPIs, filters, charts, insight text
├── kpi-card.tsx
├── performance-chart.tsx   # Batting / strike rate / economy trends
├── drill-rating-chart.tsx  # Drill rating over time
├── sessions-by-focus-chart.tsx
├── recent-sessions.tsx     # Last 3–5 sessions
├── top-performers.tsx
├── match-scenario-content.tsx
├── field-placement-content.tsx
├── theme-provider.tsx
└── ui/                     # shadcn-style primitives (button, card, select, etc.)

lib/
├── db.ts                   # Supabase client (service role), isSupabaseConfigured(), types
└── utils.ts                # cn(), etc.

scripts/
├── supabase-schema.sql     # Schema + drill_catalog seed (run once in Supabase SQL Editor)
└── setup-database.sql      # Optional demo players/sessions/stats

docs/
├── ARCHITECTURE.md         # This file
├── SUPABASE_SETUP.md       # DB setup and env
└── DEPLOYMENT.md           # Vercel deploy steps
```

**Why this layout:**  
- **Data & Ops:** Dashboard and `/api/dashboard` centralise “automate reporting and surface insights” (KPIs, trend charts, rule-based insight text).  
- **Educational:** Match Scenario and Field Placement are front-end-only tools; no DB required.

---

## 2. Minimal Supabase Schema (Step 2)

Single script: **`scripts/supabase-schema.sql`**. Run once in Supabase SQL Editor.

| Table | Purpose |
|-------|--------|
| **drill_catalog** | Predefined drills (name, type, duration, coaching_tip); seeded by script. |
| **players** | id (UUID), name, role (batter/bowler/allrounder/keeper), age_group. |
| **sessions** | id (UUID), date, focus (batting/bowling/fielding/fitness), age_group, duration_minutes, num_players, notes. |
| **drills** | id (UUID), session_id (FK), name, type, planned_duration_minutes, coaching_tip. |
| **drill_results** | id (UUID), drill_id (FK), rating_1_5 (1–5), notes; UNIQUE(drill_id). |
| **performance_stats** | id (UUID), player_id (FK), session_id (FK), balls_faced, runs_scored, dismissals, overs_bowled, runs_conceded, wickets. |

**Env:** `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. See **docs/SUPABASE_SETUP.md**.

---

## 3. Where Each Page Lives & Data Flow

| Page | Route | Purpose | Data source |
|------|--------|---------|-------------|
| Dashboard | `/` | KPIs, trend charts, insight text, filters (Player, Role, Time) | `GET /api/dashboard?player=&role=&range=` |
| Practice Planner | `/practice` | Schedule practices, add drills from catalog, record ratings | `GET/POST /api/sessions`, `GET /api/drill-catalog`, `GET/POST /api/drills`, `GET/POST /api/drill-results` |
| Match Scenario | `/scenarios` | Chase/defend calculator + MCQ (front-end only) | None |
| Field Placement | `/field` | Visual field + presets (front-end only) | None |

---

## 4. API Route Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dashboard` | GET | KPIs (avg batting, strike rate, economy, wickets/session), chart data, insight text. Query: `player`, `role`, `range` (Last 5 / 10 / All). Returns 503 when Supabase not configured. |
| `/api/players` | GET, POST | List players; create player. |
| `/api/sessions` | GET, POST | List sessions; create session. |
| `/api/stats` | GET, POST | Aggregated stats; create performance_stat. |
| `/api/drill-catalog` | GET | List predefined drills (batting, bowling, fielding, fitness). |
| `/api/drills` | GET, POST | List drills by `session_id`; add drill to session. |
| `/api/drill-results` | GET, POST | List results by `session_id`; upsert rating (1–5) and notes per drill. |

---

## 5. Track Alignment (Data & Ops)

- **Data & Ops:** Dashboard = “monitor metrics, keep teams informed” via KPIs, trend charts, drill rating over time, sessions by focus, and rule-based insight text.  
- **Educational:** Match Scenario Classroom and Field Placement Tutor are front-end tools for coaches; no backend required.

---

## 6. Next Steps (Implementation)

- **Step 3:** Dashboard with real Supabase data (or dummy fallback when not configured).  
- **Step 4+:** Optional future features (e.g. Practice Planner, auth); schema already supports sessions, drills, drill_results, performance_stats.
