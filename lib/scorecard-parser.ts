// lib/scorecard-parser.ts
// Parses text extracted from cricket scorecard PDFs (CricHeroes format and similar)

export type BattingEntry = {
  name: string;
  status: string; // how out
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
};

export type BowlingEntry = {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
};

export type InningsData = {
  teamName: string;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  batting: BattingEntry[];
  bowling: BowlingEntry[];
  extras: number;
};

export type ParsedScorecard = {
  tournament: string | null;
  matchDate: string | null;   // ISO date string YYYY-MM-DD
  venue: string | null;
  team1: string;
  team2: string;
  result: string | null;
  innings: InningsData[];
  squad1: string[];  // Full playing squad for team1
  squad2: string[];  // Full playing squad for team2
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanPlayerName(raw: string): string {
  return raw
    .replace(/\(RHB\)|\(LHB\)|\(c\)|\(C\)|\(wk\)|\(WK\)|\(†\)/gi, "")
    .replace(/†/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOvers(oStr: string): number {
  const n = parseFloat(oStr);
  if (isNaN(n)) return 0;
  const balls = Math.round((n % 1) * 10);
  return Math.floor(n) + balls / 6;
}

// Parse a date string like "2026-02-12, 06:05 AM UTC" → "2026-02-12"
function parseDate(raw: string): string | null {
  const m = raw.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parseScorecardText(pages: { text: string; num: number }[]): ParsedScorecard {
  // Flatten all pages into one text block, preserving page boundaries
  const fullText = pages.map((p) => p.text).join("\n");
  const lines = fullText.split("\n").map((l) => l.trim()).filter(Boolean);

  // ── Match metadata ──────────────────────────────────────────────────────────
  let tournament: string | null = null;
  let matchDate: string | null = null;
  let venue: string | null = null;
  let team1 = "";
  let team2 = "";
  let result: string | null = null;

  // Tournament is usually on the very first line
  if (lines.length > 0) {
    tournament = lines[0].trim();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match line: "Match\tVIT AP-B vs\nVVITU" or "Match VIT AP-B vs VVITU"
    if (/^Match\b/i.test(line)) {
      const matchStr = line.replace(/^Match\s*/i, "").replace(/\t/g, " ").trim();
      const vsMatch = matchStr.match(/^(.+?)\s+vs\s+(.+)$/i);
      if (vsMatch) {
        team1 = vsMatch[1].trim();
        team2 = vsMatch[2].trim();
      } else if (matchStr.includes("vs")) {
        // Could be split across two lines
        const nextLine = lines[i + 1] ?? "";
        const combined = matchStr + " " + nextLine;
        const m2 = combined.match(/^(.+?)\s+vs\s+(.+)$/i);
        if (m2) {
          team1 = m2[1].trim();
          team2 = m2[2].trim();
          i++;
        }
      }
    }

    // Ground/Venue
    if (/^Ground\b/i.test(line)) {
      venue = line.replace(/^Ground\s*/i, "").replace(/\t/g, " ").trim();
      // Sometimes venue continues on next line
      if (!venue.includes(",") && lines[i + 1]) {
        venue = venue + " " + lines[i + 1].trim();
        i++;
      }
    }

    // Date
    if (/^Date\b/i.test(line)) {
      const dateStr = line.replace(/^Date\s*/i, "").replace(/\t/g, " ").trim();
      matchDate = parseDate(dateStr);
    }

    // Result
    if (/^Result\b/i.test(line)) {
      result = line.replace(/^Result\s*/i, "").replace(/\t/g, " ").trim();
    }
  }

  // ── Squad parsing ───────────────────────────────────────────────────────────
  // The "Playing Squad" section looks like:
  // VVITU    VIT AP-B
  // 1   Reddy Hema Sai ( C )    Jaakeer Shaik ( C )
  // 2   Abhishekth    Abhijieeth
  // ...
  const squad1: string[] = [];
  const squad2: string[] = [];

  const squadIdx = lines.findIndex((l) => /playing squad/i.test(l));
  if (squadIdx !== -1) {
    // Next line should be the two team headers
    let teamHeaderLine = lines[squadIdx + 1] ?? "";
    // Skip if it's part of the header decorations
    if (/^\d+$/.test(teamHeaderLine)) teamHeaderLine = "";

    // Grab squad rows until we hit an innings header or another section
    for (let i = squadIdx + 2; i < lines.length; i++) {
      const l = lines[i];
      // Stop if we hit innings or match officials section
      if (/innings\b|match officials/i.test(l)) break;
      // Squad row: starts with a number
      const squadRowMatch = l.match(/^(\d+)\s+(.+)$/);
      if (!squadRowMatch) continue;

      const content = squadRowMatch[2];
      // Split by multiple spaces/tab (two names side by side)
      const parts = content.split(/\t|\s{2,}/);
      if (parts.length >= 2) {
        const n1 = cleanPlayerName(parts[0]);
        const n2 = cleanPlayerName(parts[1]);
        if (n1) squad1.push(n1);
        if (n2) squad2.push(n2);
      } else if (parts.length === 1) {
        // Some formats only list one column
        squad1.push(cleanPlayerName(parts[0]));
      }
    }
  }

  // ── Innings parsing ─────────────────────────────────────────────────────────
  // Pattern: "VIT AP-B 95/3 (10.0 Ov) (1st Innings)  Jaakeer Shaik (VIT AP-B)"
  const innings: InningsData[] = [];

  const inningsHeaderPattern = /^(.+?)\s+(\d+)\/(\d+)\s+\((\d+\.?\d*)\s*Ov\)/;
  let inningsStart = -1;
  const inningsStarts: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (inningsHeaderPattern.test(lines[i])) {
      inningsStarts.push(i);
    }
  }

  for (let ii = 0; ii < inningsStarts.length; ii++) {
    const start = inningsStarts[ii];
    const end = inningsStarts[ii + 1] ?? lines.length;

    const headerLine = lines[start];
    const hm = headerLine.match(/^(.+?)\s+(\d+)\/(\d+)\s+\((\d+\.?\d*)\s*Ov\)/);
    if (!hm) continue;

    const inningsTeam = hm[1].trim();
    const totalRuns = parseInt(hm[2], 10);
    const totalWickets = parseInt(hm[3], 10);
    const totalOvers = parseFloat(hm[4]);

    const inningsLines = lines.slice(start + 1, end);

    const batting: BattingEntry[] = [];
    const bowling: BowlingEntry[] = [];
    let extras = 0;

    // ── Batting table ─────────────────────────────────────────────────────────
    // Row: "1  Ashwanth Nivas (RHB)  b Manohar Sai  46 28 36 4 3 164.29"
    // Cols: No | Batsman | Status | R B M 4s 6s SR
    const battingRowPattern = /^(\d+)\s+(.+?)\s{2,}(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)$/;
    // Simpler pattern without minutes
    const battingRowSimple = /^(\d+)\s+(.+?)\s{2,}(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)$/;

    let inBattingSection = true;
    let inBowlingSection = false;

    for (const iLine of inningsLines) {
      // Detect bowling section start: "No  Bowler  O M R  W  ..."
      if (/^No\s+Bowler\b/i.test(iLine)) {
        inBattingSection = false;
        inBowlingSection = true;
        continue;
      }

      // Extras line
      if (/^Extras:/i.test(iLine)) {
        const em = iLine.match(/(\d+)\s*$/);
        if (em) extras = parseInt(em[1], 10);
        continue;
      }

      if (inBattingSection) {
        // Try to match the numeric stats at the end of the row
        // Pattern: [R] [B] [M?] [4s] [6s] [SR]
        const statsMatchFull = iLine.match(/(?:\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+))$/);
        const statsMatchSimple = iLine.match(/(?:\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+))$/);
        
        let runs = 0, balls = 0, fours = 0, sixes = 0, sr = 0;
        let prefixStr = "";
        
        if (statsMatchFull) {
          runs = parseInt(statsMatchFull[1], 10);
          balls = parseInt(statsMatchFull[2], 10);
          fours = parseInt(statsMatchFull[4], 10);
          sixes = parseInt(statsMatchFull[5], 10);
          sr = parseFloat(statsMatchFull[6]);
          prefixStr = iLine.substring(0, statsMatchFull.index).trim();
        } else if (statsMatchSimple) {
          runs = parseInt(statsMatchSimple[1], 10);
          balls = parseInt(statsMatchSimple[2], 10);
          fours = parseInt(statsMatchSimple[3], 10);
          sixes = parseInt(statsMatchSimple[4], 10);
          sr = parseFloat(statsMatchSimple[5]);
          prefixStr = iLine.substring(0, statsMatchSimple.index).trim();
        } else {
          continue; // not a valid batting row
        }
        
        // prefixStr is like: "1  Prithvi BPCA c Harshavardhana.V b Monish C"
        // Strip the starting number
        prefixStr = prefixStr.replace(/^\d+\s+/, "");
        
        // Now we have "Prithvi BPCA c Harshavardhana.V b Monish C"
        // Split name and status using a robust regex looking at the end of the string
        const statusPattern = /\b(not out|run out.*|c & b.*|c\s+.*?\s+b\s+.*|c\s+.*|b\s+.*|lbw.*|st\s+.*|hit wicket.*|retired.*|absent.*)$/i;
        const statusMatch = prefixStr.match(statusPattern);
        
        let name = prefixStr;
        let status = "";
        
        if (statusMatch) {
          status = statusMatch[0];
          name = prefixStr.substring(0, statusMatch.index).trim();
        } else {
          // Fallback if regex doesn't match: split by multiple spaces
          const parts = prefixStr.split(/\s{2,}/);
          if (parts.length >= 2) {
             status = parts.pop() || "";
             name = parts.join(" ");
          }
        }
        
        // Only push if we actually extracted a name
        if (name) {
          batting.push({
            name: cleanPlayerName(name),
            status: status.trim(),
            runs,
            balls,
            fours,
            sixes,
            strikeRate: sr,
          });
        }
      }

      if (inBowlingSection) {
        // "1  Abhishekth  2  0  21 0  3  2  1  1  0  10.50"
        // Cols: No | Bowler | O M R W 0s 4s 6s WD NB Eco
        const bowlMatch = iLine.match(
          /^(\d+)\s+(.+?)\s{2,}(\d+\.?\d*)\s+(\d+)\s+(\d+)\s+(\d+)\s+.+?([\d.]+)\s*$/
        );
        if (bowlMatch) {
          bowling.push({
            name: cleanPlayerName(bowlMatch[2]),
            overs: parseOvers(bowlMatch[3]),
            maidens: parseInt(bowlMatch[4], 10),
            runs: parseInt(bowlMatch[5], 10),
            wickets: parseInt(bowlMatch[6], 10),
            economy: parseFloat(bowlMatch[7]),
          });
        }
      }
    }

    innings.push({
      teamName: inningsTeam,
      totalRuns,
      totalWickets,
      totalOvers,
      batting,
      bowling,
      extras,
    });
  }

  // If squad parsing didn't work well, build from batting data
  if (squad1.length === 0 && innings.length > 0) {
    innings[0]?.batting.forEach((b) => squad1.push(b.name));
    innings[1]?.batting.forEach((b) => squad2.push(b.name));
  }

  // Determine which squad belongs to which team using the innings data
  // innings[0] is team1's batting, innings[1] is team2's batting
  // The squad order from the PDF is [squad_of_team2, squad_of_team1] (VVITU | VIT AP-B)
  // so we might need to swap depending on format. We keep as-is and trust PDF order.

  return {
    tournament,
    matchDate,
    venue,
    team1: team1 || innings[0]?.teamName || "Team 1",
    team2: team2 || innings[1]?.teamName || "Team 2",
    result,
    innings,
    squad1,
    squad2,
  };
}

/** Get all unique player names from a parsed scorecard */
export function getAllPlayerNames(scorecard: ParsedScorecard): string[] {
  const names = new Set<string>();
  [...scorecard.squad1, ...scorecard.squad2].forEach((n) => names.add(n));
  scorecard.innings.forEach((inn) => {
    inn.batting.forEach((b) => names.add(b.name));
    inn.bowling.forEach((b) => names.add(b.name));
  });
  return Array.from(names).filter(Boolean);
}
