# Cricket IQ Coach – Setup in 3 Steps

Your app is connected to Supabase, but the **database has no tables yet**. The app needs those tables to show the dashboard. Follow these 3 steps.

---

## Step 1: Open Supabase

1. Go to **https://supabase.com** in your browser.
2. Log in.
3. Click your project **cricketiqcoach** (or the one with URL `grrjjiwldpkdfkdqajgd`).

---

## Step 2: Run the schema (create the tables)

1. On the **left side** of the Supabase page, click **"SQL Editor"**.
2. Click **"New query"** (top right of the SQL area).
3. Open this file on your computer:  
   **`scripts/supabase-schema.sql`**  
   (It’s in your project folder, inside the `scripts` folder.)
4. **Select all** the text in that file (Ctrl+A) and **copy** it (Ctrl+C).
5. Go back to the Supabase browser tab. **Paste** that text into the big empty box (Ctrl+V).
6. Click the green **"Run"** button (or press Ctrl+Enter).
7. Wait a few seconds. At the bottom you should see something like **"Success. No rows returned"** or **"Success"**.  
   If you see red error text, tell me what it says.

---

## Step 3: Check the app

1. In your project folder, open a terminal/command prompt.
2. Run:  
   **`node scripts/check-api.js`**
3. You should see:  
   **`Status: 200`**  
   If you see **`Status: 500`**, the tables are still not there — repeat Step 2 and make sure the Run finished with no errors.

---

## What this does (simple version)

- **Supabase** = your online database.
- **Tables** = where the app stores players, sessions, etc.
- **Schema script** = a file that tells Supabase: “create these tables.”
- Until you **run that script** in Supabase (Step 2), the tables don’t exist, so the app shows an error.  
  After you run it once, the app can run.

---

## Need help?

- If **Step 2** shows an error when you click Run, copy the error message and share it.
- If **Step 3** still shows **Status: 500**, say so and we’ll fix it.
