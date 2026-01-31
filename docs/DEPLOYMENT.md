# Deploy Cricket IQ Coach

## GitHub — Repo name and description

**Suggested repository names** (pick one):

- `cricket-iq-coach` — matches the app name, clear and short
- `cricket-iq-coach-app` — if you want to distinguish from other cricket-iq repos
- `cricket-coach-dashboard` — emphasizes the dashboard/analytics side

**Suggested description** (for the repo “About” on GitHub):

```
Cricket IQ Coach — Analytics dashboard and coaching tool for cricket academies and teams. Track sessions, players, drills, and performance with Supabase + Next.js. Built for VIT-AP Prompt to Production.
```

Or shorter:

```
Analytics and coaching dashboard for cricket teams. Sessions, players, drills, performance tracking. Next.js + Supabase.
```

---

## Step-by-step: Deploy on Vercel

### Step 1: Create the GitHub repository

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:** e.g. `cricket-iq-coach`.
3. **Description:** Paste one of the descriptions above (or your own).
4. Choose **Public** (or Private if you prefer).
5. Do **not** add a README, .gitignore, or license if your project already has them.
6. Click **Create repository**.

---

### Step 2: Push your code to GitHub

If the project is **not** yet a git repo:

```bash
cd "Prompt to Production VIT-AP (Cricket IQ Coach)"
git init
git add .
git commit -m "Initial commit: Cricket IQ Coach"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cricket-iq-coach.git
git push -u origin main
```

If it **is** already a git repo and you only need to add the new remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/cricket-iq-coach.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and `cricket-iq-coach` with your repo name.

---

### Step 3: Sign in to Vercel and import the project

1. Go to [vercel.com](https://vercel.com) and sign in (use **Continue with GitHub** if you use GitHub).
2. Click **Add New…** → **Project**.
3. You should see your GitHub account; select the **cricket-iq-coach** (or your repo name) repository.
4. If you don’t see it, click **Import Git Repository** and paste the repo URL, then **Import**.

---

### Step 4: Configure the project (Vercel)

1. **Project Name:** Leave as-is or set something like `cricket-iq-coach`.
2. **Root Directory:** Leave as **.** (root) unless the app lives in a subfolder (e.g. in a monorepo).
3. **Framework Preset:** Vercel should detect **Next.js**; leave it.
4. **Build Command:** Leave default (`next build`).
5. **Output Directory:** Leave default (Next.js sets this).
6. **Install Command:** Leave default (`npm install`).

Do **not** click Deploy yet — add environment variables first.

---

### Step 5: Add environment variables

1. In the same import/setup screen, open **Environment Variables** (or go to **Project → Settings → Environment Variables** after the first deploy).
2. Add these for **Production** (and **Preview** if you want branch deploys to use the same DB):

| Name | Value | Notes |
|------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase **service_role** key | Same page; use **service_role**, not anon |

3. For each variable: enter **Name** and **Value**, choose **Production** (and optionally **Preview**), then click **Add** or **Save**.

Optional (only if you enable AI features):

- `NEXT_PUBLIC_AI_BEHAVIORAL_ENABLED` = `true`
- `NEXT_PUBLIC_AI_CHAT_ENABLED` = `true`

4. Click **Deploy** (or **Save** then trigger a deploy).

---

### Step 6: Prepare Supabase (database)

1. In [Supabase](https://supabase.com), open your project.
2. Go to **SQL Editor**.
3. Run the full script in **`scripts/supabase-schema.sql`** (creates tables and drill catalog).
4. (Optional) Run **`scripts/add-player-profile-columns.sql`** if the schema was created before those columns existed.
5. (Optional) Run **`scripts/setup-database.sql`** for demo players/sessions/stats.

---

### Step 7: Deploy and open the app

1. On Vercel, click **Deploy** (if you didn’t already).
2. Wait for the build to finish (usually 1–2 minutes).
3. When it’s done, click **Visit** or open the URL Vercel shows (e.g. `https://cricket-iq-coach.vercel.app`).

---

### Step 8: Verify after deploy

- Open the deployed URL; you should see the app (Dashboard or landing).
- If env vars are missing or wrong, the Dashboard may show demo data and messages like “Supabase not configured.”
- After Supabase is set up and env vars are correct, the Dashboard, Players, Sessions, and Practice Planner should use real data.

---

## Summary checklist

- [ ] Create GitHub repo (name + description).
- [ ] Push code to GitHub (`main` branch).
- [ ] Vercel → Add New → Project → Import repo.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
- [ ] Deploy.
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
