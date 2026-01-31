# Excel import format (Cricket IQ Coach)

Use **one sheet** with the first row as the header. Exact spelling not required; we match by trimming and ignoring case.

---

## Required columns (ball-by-ball format)

**Your file must have at least these columns:**

| Column         | Description                              |
|----------------|------------------------------------------|
| **season**     | e.g. 2023, IPL 2023                      |
| **start_date** | Date the match/event started            |
| **venue**      | Location of the match                    |
| **innings**    | Innings number (e.g. 1st, 2nd)           |
| **ball**       | Ball number within the over              |
| **batting_team** | Team currently batting                 |
| **bowling_team** | Team currently bowling                 |
| **striker**    | Batsman facing the ball                  |
| **non_striker**| Batsman at non-striker end               |
| **bowler**     | Bowler delivering the ball               |
| **runs_off_bat** | Runs scored off that ball              |
| **extras**     | Extra runs (wides, no-balls, byes, etc.)  |

---

## Simple format (one row per performance)

Use **one row per performance record** with the columns below.

## Required columns

| Column name        | Example   | Description                          |
|--------------------|-----------|--------------------------------------|
| **player_name**    | Rahul     | Player’s name (creates player if new)|
| **session_date**   | 2025-01-15| Date of the session (YYYY-MM-DD)     |
| **session_focus**  | batting   | batting / bowling / fielding / fitness |

## Optional (player)

| Column name | Example  | Description                    |
|-------------|----------|--------------------------------|
| role        | batter   | batter / bowler / allrounder / keeper |
| age_group   | U19      | U12 / U16 / U19 / College      |

## Optional (session)

| Column name              | Example | Description              |
|--------------------------|---------|--------------------------|
| session_duration_minutes | 60      | Session length in minutes|
| session_num_players      | 8       | Number of players       |
| session_age_group        | U19     | U12, U13, U15, U16, U17, U19, College, Senior |

## Optional (performance stats)

| Column name    | Example | Description        |
|----------------|---------|--------------------|
| runs_scored    | 45      | Batting runs       |
| balls_faced    | 32      | Balls faced        |
| dismissals      | 0       | Times out           |
| overs_bowled   | 4       | Overs bowled       |
| runs_conceded  | 28      | Runs conceded      |
| wickets        | 2       | Wickets taken      |

## Example (first row = header)

```
player_name | role   | age_group | session_date | session_focus | session_duration_minutes | runs_scored | balls_faced | dismissals | overs_bowled | runs_conceded | wickets
Rahul       | batter | U19      | 2025-01-15   | batting       | 60                       | 45          | 32          | 0          |              |               |
Priya       | bowler | U16      | 2025-01-15   | bowling       | 60                       |            |             |            | 4            | 28            | 2
```

- Rows without a header row are skipped.
- Empty numeric cells are treated as 0 or null as appropriate.
- If **player_name** doesn’t exist, we create a player using **role** and **age_group** (or defaults).
- If **session_date** + **session_focus** don’t match an existing session, we create a session.

**Accepted file types:** **.xlsx**, **.xls**, **.csv**, **.json**

- **.xlsx / .xls** – First sheet, first row = header.
- **.csv** – First row = header; same column names as above.
- **.json** – Array of objects, e.g. `[{ "player_name": "Rahul", "session_date": "2025-01-15", ... }, ...]`.

Save or export your data in any of these formats and use **Import** in the app to upload; records are added to the website.
