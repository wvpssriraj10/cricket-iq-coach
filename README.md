# Cricket IQ Coach

**Analytics dashboard and coaching tool for cricket academies and teams.** Track sessions, players, drills, and performance with a modern stack. Built for **VIT-AP Prompt to Production**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

**Live demo:** [cricket-iq-coach.vercel.app](https://cricket-iq-coach.vercel.app/)

---

## Features

### 🌟 UI/UX & Magic Components
- **Golden Sports Analytics Theme** — Completely overhauled design system featuring a premium Midnight Blue & Amber aesthetic.
- **Magic Spotlight Hover Effects** — Interactive KPI cards that follow your cursor with dynamic, glowing spotlights.
- **Redesigned Auth Flow** — Sleek login interface with floating labels, OAuth integrations, and animated visual backdrops.

### 📊 Automated Performance Analytics
- **Live Stats Engine** — Dashboard auto-aggregates stats from every imported match (batting average, strike rate, bowling economy, wickets per session). No manual entry required.
- **Performance Trends** — Visualized charts for performance over time, drill ratings, and sessions by focus.
- **Full-Width Data Grids** — Scalable player management tables with real-time search filtering.

### 📄 PDF Scorecard Import Engine
- **CricHeroes Integration** — Upload scorecard PDFs to automatically parse both innings, extract all batters/bowlers, and write to the database.
- **Smart Conflict Resolution** — Automatically handles player name conflicts (e.g., initial truncations) during import.

### 🏏 Tactical & Educational Tools
- **Field Placement Tutor** — Interactive SVG ground with drag-and-drop fielder repositioning and context-aware tactical presets (e.g., T20 powerplay, ODI middle overs).
- **Match Scenario Classroom** — Chase/defend calculator and situational MCQ quizzes to test cricket IQ.

### 📋 Practice Planner & Team Management
- **Drill Catalog** — Schedule sessions and pick from a 21-drill catalog logging ratings (1-5) to track trends.
- **Squad Management** — Create teams, manage roles, and compare squads head-to-head. Download progress reports as `.docx`.

### 🤖 AI-Ready (Optional)
- **Feature Flags** — All AI features gated by `NEXT_PUBLIC_AI_*` env vars.
- **Behavioral Tracking & Chat** — Anonymous scroll tracking and a stub conversational UI.

---

## Tech stack

| Layer        | Choice                          |
|-------------|----------------------------------|
| Framework   | Next.js 16 (App Router)          |
| Language    | TypeScript 5                    |
| UI          | React 19, Tailwind CSS 4, Radix UI, shadcn-style components |
| Data        | Supabase (Postgres)             |
| Charts      | Recharts                        |
| Forms       | React Hook Form, Zod            |
| Data fetch  | SWR                             |
| Export      | docx (Word), xlsx (Excel)       |
| Deploy      | Vercel                          |

---

## Getting started

### Prerequisites

- **Node.js** 18+
- **pnpm** (or npm / yarn)
- **Supabase** account (free tier is enough)

### 1. Clone and install

```bash
git clone https://github.com/wvpssriraj10/cricket-iq-coach.git
cd cricket-iq-coach
pnpm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from [Supabase](https://supabase.com) → your project → **Settings → API**.

### 3. Database setup

1. In Supabase **SQL Editor**, run **`scripts/supabase-schema.sql`** (creates tables and seeds drill catalog).
2. If you need extra player profile columns, run **`scripts/add-player-profile-columns.sql`** once.
3. Optional: run **`scripts/setup-database.sql`** for demo data.

See **`docs/SUPABASE_SETUP.md`** for details.

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Practice** to create a session and add drills once the DB is set up.

---

## Project structure

```
app/
├── layout.tsx              # Root layout, AI layers
├── page.tsx                # Dashboard
├── players/page.tsx        # Squad, KPIs, filters, export
├── sessions/page.tsx       # Sessions list
├── practice/page.tsx       # Practice planner, drills
├── import/page.tsx         # Excel import
├── scenarios/page.tsx      # Match scenario tool
├── field/page.tsx          # Field placement tool
└── api/                    # API routes (dashboard, players, sessions, drills, etc.)

components/
├── app-shell.tsx           # Layout (sidebar + main)
├── app-sidebar.tsx         # Navigation
├── dashboard-content.tsx   # Dashboard KPIs and charts
├── recent-sessions.tsx
├── kpi-card.tsx
├── ai/                     # AI layers (behavioral, chat widget)
└── ui/                     # Shared UI primitives

lib/
├── supabase.ts             # Supabase client
├── db.ts                   # DB helpers, types
├── ai-features.ts          # Feature flags for AI
└── behavioral-tracking.ts  # Client-side tracking (optional)

scripts/                    # SQL: schema, seed, migrations
docs/                       # Architecture, deployment, Supabase, Excel format
```

---

## API overview

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/dashboard` | GET | KPIs, chart data, insight text (query: `player`, `role`, `range`) |
| `/api/players` | GET, POST | List and create players |
| `/api/players/[id]` | GET, PATCH, DELETE | Get, update, or remove a player |
| `/api/players/[id]/export` | GET | Download player progress as .docx |
| `/api/sessions` | GET, POST | List and create sessions |
| `/api/stats` | GET, POST | Aggregated stats, create performance_stat |
| `/api/drill-catalog` | GET | Predefined drills |
| `/api/drills` | GET, POST | Drills by session; add drill |
| `/api/drill-results` | GET, POST | Results and ratings by session |
| `/api/import` | POST | Bulk import from Excel |
| `/api/ai/behavioral` | POST | Log behavioral events (optional) |
| `/api/ai/chat` | POST | Stub chat response (optional) |

---

## Deploy on Vercel (step-by-step)

1. **GitHub** — Push this repo to GitHub (e.g. `wvpssriraj10/cricket-iq-coach`).
2. **Vercel** — Go to [vercel.com](https://vercel.com) → **Add New → Project** → Import your repo.
3. **Build settings** — Leave defaults (Next.js, root directory `.`). If you set Install Command, use only `pnpm install` or leave it empty so Vercel auto-detects from `pnpm-lock.yaml`.
4. **Environment variables** — Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from Supabase → Settings → API).
5. **Deploy** — Click **Deploy**; wait for the build, then **Visit**.
6. **Supabase** — In Supabase **SQL Editor**, run `scripts/supabase-schema.sql` (and optionally `add-player-profile-columns.sql`, `setup-database.sql`).
7. **Verify** — Open the Vercel URL; Dashboard, Players, and Practice should use real data.

**Live app:** [https://cricket-iq-coach.vercel.app](https://cricket-iq-coach.vercel.app)

**Full guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — prerequisites, screens, checklist, custom domain, rollback.

---

## Documentation

| Doc | Description |
|-----|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder structure, schema, data flow |
| [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Env vars, schema, optional RLS |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel deploy and GitHub setup |
| [EXCEL_IMPORT_FORMAT.md](docs/EXCEL_IMPORT_FORMAT.md) | Spreadsheet format for bulk import |
| [AI_ENHANCEMENT_SPEC.md](docs/AI_ENHANCEMENT_SPEC.md) | AI layer design and feature flags |

---

## License

MIT.
