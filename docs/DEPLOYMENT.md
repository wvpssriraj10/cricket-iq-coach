# Deploy Cricket IQ Coach on Vercel

Step-by-step guide to deploy the app to [Vercel](https://vercel.com) with [Supabase](https://supabase.com) as the database.

---

## Before you start

- **GitHub account** — You'll connect Vercel to GitHub.
- **Vercel account** — Sign up at [vercel.com](https://vercel.com) (use "Continue with GitHub").
- **Supabase project** — Create one at [supabase.com](https://supabase.com) and note:
  - **Project URL** (e.g. `https://xxxxx.supabase.co`)
  - **service_role** key (Settings → API → Project API keys → `service_role`)

---

## Step 1: Have your code on GitHub

Your app must be in a GitHub repository so Vercel can import it.

**If you already pushed this project to GitHub** (e.g. `wvpssriraj10/cricket-iq-coach`), skip to **Step 2**.

**If the project is not on GitHub yet:**

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:** e.g. `cricket-iq-coach`.
3. **Description (optional):** e.g. *Analytics and coaching dashboard for cricket teams. Next.js + Supabase.*
4. Choose **Public**. Do **not** add a README, .gitignore, or license (the project already has them).
5. Click **Create repository**.
6. In your project folder, run (replace `YOUR_USERNAME` with your GitHub username):

```bash
git init
git add .
git commit -m "Initial commit: Cricket IQ Coach"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cricket-iq-coach.git
git push -u origin main
```

---

## Step 2: Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (**Continue with GitHub** if needed).
2. Click **Add New…** → **Project**.
3. Under **Import Git Repository**, find **cricket-iq-coach** (or your repo name) and click **Import**.
4. If the repo does not appear, click **Import Third-Party Git Repository**, paste  
   `https://github.com/wvpssriraj10/cricket-iq-coach` (or your repo URL), then **Import**.

---

## Step 3: Configure build settings (Vercel)

On the import configuration screen, leave defaults unless your app is in a subfolder:

| Setting | Value |
|--------|--------|
| **Project Name** | `cricket-iq-coach` (or any name) |
| **Root Directory** | `.` (leave as root) |
| **Framework Preset** | Next.js (auto-detected) |
| **Build Command** | `next build` |
| **Output Directory** | (default) |
| **Install Command** | Leave **empty** (Vercel auto-detects pnpm from `pnpm-lock.yaml`) or set `pnpm install` only — do not enter "npm install or pnpm install" |

Do **not** click **Deploy** yet — add environment variables next.

---

## Step 4: Add environment variables in Vercel

1. On the same page, expand **Environment Variables**.
2. Add these two variables (use **Production**; add **Preview** too if you want preview deployments to use the same DB):

| Name | Value | Where to get it |
|------|--------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Supabase → Project Settings → API → **Project URL** |
| `SUPABASE_SERVICE_ROLE_KEY` | Long secret key | Same page → **Project API keys** → **service_role** (secret) |

3. For each row: type the **Name**, paste the **Value**, select **Production** (and optionally **Preview**), then click **Add**.
4. Double-check for typos and that you used the **service_role** key, not the `anon` key.

**Optional (only if you enable AI features):**

- `NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED` = `true`
- `NEXT_PUBLIC_AI_CHAT_ENABLED` = `true`

---

## Step 5: Deploy

1. Click **Deploy**.
2. Wait for the build to finish (usually 1–2 minutes). You can follow the build logs on the deployment page.
3. When the status is **Ready**, click **Visit** to open your app (e.g. `https://cricket-iq-coach.vercel.app`).

---

## Step 6: Set up the database in Supabase

The app needs tables and seed data in Supabase. Do this once per Supabase project.

1. Open [Supabase](https://supabase.com) → your project.
2. Go to **SQL Editor**.
3. **Create schema and drill catalog:**  
   Open `scripts/supabase-schema.sql` from this repo, copy its full contents, paste into a new query in the SQL Editor, and click **Run**.
4. **Optional — extra player columns:**  
   If you use player profile fields (batting arm, bowler type, etc.), run `scripts/add-player-profile-columns.sql` in the SQL Editor once.
5. **Optional — demo data:**  
   Run `scripts/setup-database.sql` in the SQL Editor to add sample players/sessions/stats.

After this, your Vercel app will use the same Supabase project (via the env vars you set) and show real data.

---

## Step 7: Verify the deployment

1. Open your Vercel URL (e.g. `https://cricket-iq-coach.vercel.app`).
2. You should see the Dashboard. If env vars were wrong or missing, you might see "Supabase not configured" or empty data.
3. Check **Players**, **Sessions**, and **Practice** — they should load and, after Step 6, use data from Supabase.

---

## Summary checklist

- [ ] Code is on GitHub (`main` branch).
- [ ] Vercel → Add New → Project → Import repo.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
- [ ] Click Deploy and wait for build to finish.
- [ ] Run `scripts/supabase-schema.sql` in Supabase SQL Editor.
- [ ] Open the Vercel URL and verify the app.

---

## Custom domain (optional)

1. In Vercel: **Project → Settings → Domains**.
2. Add your domain and follow the DNS instructions.
3. Vercel will issue SSL automatically.

---

## Rollback

- **Revert code:** Push a previous commit to `main`; Vercel will redeploy.
- **Previous deployment:** Vercel → **Deployments** → open a past deployment → **Promote to Production**.

---

## Repo name and description (for GitHub)

**Repo name examples:** `cricket-iq-coach`, `cricket-iq-coach-app`

**Repo description (for GitHub "About"):**

```
Cricket IQ Coach — Analytics dashboard and coaching tool for cricket academies and teams. Track sessions, players, drills, and performance. Next.js + Supabase. Built for VIT-AP Prompt to Production.
```
