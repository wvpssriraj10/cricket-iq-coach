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

export type SquadPlayer = {
  name: string;
  isCaptain: boolean;
  isWicketKeeper: boolean;
  exactRawName: string;
};

export type ParsedScorecard = {
  tournament: string | null;
  matchDate: string | null;   // ISO date string YYYY-MM-DD
  venue: string | null;
  team1: string;
  team2: string;
  result: string | null;
  innings: InningsData[];
  squad1: SquadPlayer[];
  squad2: SquadPlayer[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanPlayerName(raw: string): string {
  return raw
    .replace(/\(\s*RHB\s*\)|\(\s*LHB\s*\)|\(\s*c\s*\)|\(\s*wk\s*\)|\(\s*†\s*\)/gi, "")
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

function parseSquadPlayer(raw: string): SquadPlayer | null {
  const t = raw.trim();
  if (!t) return null;
  const isCaptain = /\(\s*c\s*\)/i.test(t);
  const isWicketKeeper = /\(\s*wk\s*\)|\(\s*†\s*\)|†/i.test(t);
  const name = cleanPlayerName(t);
  if (!name) return null;
  return { name, isCaptain, isWicketKeeper, exactRawName: t };
}

function normalizeForMatch(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchToSquadName(rowName: string, squadList1: SquadPlayer[], squadList2: SquadPlayer[]): string {
  const allSquad = [...squadList1, ...squadList2];
  const normRow = normalizeForMatch(rowName);
  
  if (!normRow) return cleanPlayerName(rowName);

  for (const sq of allSquad) {
    if (normalizeForMatch(sq.name) === normRow) return sq.name;
  }
  
  for (const sq of allSquad) {
    const normSq = normalizeForMatch(sq.name);
    if (normSq.includes(normRow) || normRow.includes(normSq)) {
      return sq.name;
    }
  }
  
  return cleanPlayerName(rowName);
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
  const squad1: SquadPlayer[] = [];
  const squad2: SquadPlayer[] = [];

  const squadIdx = lines.findIndex((l) => /playing squad/i.test(l));
  if (squadIdx !== -1) {
    // In pdf2json, the squad table often appears ABOVE the "Playing Squad" text.
    // We scan upwards to collect the rows.
    let foundSquad = false;
    for (let i = squadIdx - 1; i >= 0; i--) {
      const l = lines[i];
      if (/^\d+\s+/.test(l)) {
        const squadRowMatch = l.match(/^(\d+)\s+(.+)$/);
        if (squadRowMatch) {
          const content = squadRowMatch[2];
          // Split by 2 or more spaces
          const parts = content.split(/\s{2,}/);
          if (parts.length >= 2) {
            const p1 = parseSquadPlayer(parts[0]);
            const p2 = parseSquadPlayer(parts[1]);
            if (p1) squad1.unshift(p1);
            if (p2) squad2.unshift(p2);
          } else if (parts.length === 1) {
            const p1 = parseSquadPlayer(parts[0]);
            if (p1) squad1.unshift(p1);
          }
          foundSquad = true;
        }
      } else {
        // If we hit a non-number line and we already collected players, we reached the top
        if (foundSquad) break;
      }
    }

    // Fallback: If upwards scan found nothing, try forwards scan
    if (!foundSquad) {
      for (let i = squadIdx + 1; i < lines.length; i++) {
        const l = lines[i];
        if (/innings\b|match officials/i.test(l)) break;
        if (/^\d+\s+/.test(l)) {
          const squadRowMatch = l.match(/^(\d+)\s+(.+)$/);
          if (squadRowMatch) {
            const content = squadRowMatch[2];
            const parts = content.split(/\s{2,}/);
            if (parts.length >= 2) {
              const p1 = parseSquadPlayer(parts[0]);
              const p2 = parseSquadPlayer(parts[1]);
              if (p1) squad1.push(p1);
              if (p2) squad2.push(p2);
            } else if (parts.length === 1) {
              const p1 = parseSquadPlayer(parts[0]);
              if (p1) squad1.push(p1);
            }
            foundSquad = true;
          }
        } else {
          if (foundSquad) break;
        }
      }
    }
  }

  // ── Innings parsing ─────────────────────────────────────────────────────────
  const innings: InningsData[] = [];

  const battingHeaders: number[] = [];
  const bowlingHeaders: number[] = [];
  const inningsHeaders: number[] = [];

  const inningsHeaderPattern = /^(.+?)\s+(\d+)\/(\d+)\s+\((\d+\.?\d*)\s*Ov\)/;

  for (let i = 0; i < lines.length; i++) {
    if (/^No\s+Batsman\b/i.test(lines[i])) battingHeaders.push(i);
    if (/^No\s+Bowler\b/i.test(lines[i])) bowlingHeaders.push(i);
    if (inningsHeaderPattern.test(lines[i])) inningsHeaders.push(i);
  }

  function extractTableRows(headerIdx: number): string[] {
    const rows: string[] = [];
    let foundAbove = false;
    // Check above first (pdf2json often renders bottom-up)
    for (let i = headerIdx - 1; i >= 0; i--) {
      const lineTrimmed = lines[i].trim();
      if (/^\d+\s+/.test(lines[i])) {
        // The lowest number row is always closest to the header, so pushing maintains 1..N order
        rows.push(lines[i]);
        foundAbove = true;
      } else {
        // Stop if we hit a non-number line, UNLESS we haven't found any rows yet
        // Sometimes there are blank lines, "Extras", or "(RHB)" right above the header
        const isIgnorable = lineTrimmed === "" || /^\(RHB\)|\(LHB\)$/i.test(lineTrimmed);
        if (foundAbove && !isIgnorable) break;
      }
    }
    if (foundAbove) return rows;

    // Check below (standard top-down)
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const lineTrimmed = lines[i].trim();
      if (/^\d+\s+/.test(lines[i])) {
        rows.push(lines[i]);
      } else {
        const isIgnorable = lineTrimmed === "" || /^\(RHB\)|\(LHB\)$/i.test(lineTrimmed);
        if (rows.length > 0 && !isIgnorable) break;
      }
    }
    return rows;
  }

  const battingBlocks = battingHeaders.map((idx) => extractTableRows(idx));
  const bowlingBlocks = bowlingHeaders.map((idx) => extractTableRows(idx));

  for (let i = 0; i < inningsHeaders.length; i++) {
    const headerLine = lines[inningsHeaders[i]];
    const hm = headerLine.match(inningsHeaderPattern);
    if (!hm) continue;

    const inningsTeam = hm[1].trim();
    const totalRuns = parseInt(hm[2], 10);
    const totalWickets = parseInt(hm[3], 10);
    const totalOvers = parseFloat(hm[4]);

    const batting: BattingEntry[] = [];
    const bowling: BowlingEntry[] = [];
    
    const batRows = battingBlocks[i] || [];
    const bowlRows = bowlingBlocks[i] || [];

    // Parse Batting Rows
    let currentBatterName = "";

    for (let i = 0; i < batRows.length; i++) {
      const iLine = batRows[i];

      const statsMatchFull = iLine.match(/(?:\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+))$/);
      const statsMatchSimple = iLine.match(/(?:\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+))$/);
      
      if (!statsMatchFull && !statsMatchSimple) {
        const nameMatch = iLine.match(/^\d+\s+(.+)$/);
        if (nameMatch) {
          currentBatterName = cleanPlayerName(nameMatch[1]);
        }
        continue;
      }
      
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
        continue;
      }
      
      prefixStr = prefixStr.replace(/^\d+\s+/, "");
      
      let name = "";
      let status = "";
      
      if (currentBatterName) {
        name = currentBatterName;
        status = prefixStr;
        currentBatterName = ""; // reset
      } else {
        const parts = prefixStr.split(/\s{2,}/);
        if (parts.length >= 2) {
          status = parts.pop() || "";
          name = parts.join(" ");
        } else {
          const statusPattern = /\b(not out|run out.*|c & b.*|c\s+.*?\s+b\s+.*|c\s+.*|b\s+.*|lbw.*|st\s+.*|hit wicket.*|retired.*|absent.*)$/i;
          const statusMatch = prefixStr.match(statusPattern);
          if (statusMatch) {
            status = statusMatch[0];
            name = prefixStr.substring(0, statusMatch.index).trim();
          } else {
            name = prefixStr;
          }
        }
      }
      
      if (name) {
        batting.push({
          name: matchToSquadName(name, squad1, squad2),
          status: status.trim(),
          runs, balls, fours, sixes, strikeRate: sr,
        });
      }
    }

    // Parse Bowling Rows
    for (const iLine of bowlRows) {
      // Pattern: No | Bowler | O M R W (0s) 4s 6s (WD NB) Eco
      // The exact number of columns varies. Let's look for Bowler name and the trailing stats.
      // Usually starts with \d+ \s+ Name. Then the rest are numbers.
      // Let's strip the leading number:
      let prefixStr = iLine.replace(/^\d+\s+/, "").trim();
      // Extract all trailing numbers (now handling parentheses for extras)
      const trailingNumbersMatch = prefixStr.match(/((?:\s+[\d.]+|\s+\([\d\s]+\))+)$/);
      if (trailingNumbersMatch) {
        const name = prefixStr.substring(0, trailingNumbersMatch.index).trim();
        const rawNumbers = trailingNumbersMatch[1].replace(/[()]/g, '').trim();
        const numStrs = rawNumbers.split(/\s+/);
        // Minimum stats: O M R W Eco (5)
        // Max stats: O M R W 0s 4s 6s WD NB Eco (10)
        if (numStrs.length >= 5) {
          bowling.push({
            name: matchToSquadName(name, squad1, squad2),
            overs: parseOvers(numStrs[0]),
            maidens: parseInt(numStrs[1], 10),
            runs: parseInt(numStrs[2], 10),
            wickets: parseInt(numStrs[3], 10),
            economy: parseFloat(numStrs[numStrs.length - 1]),
          });
        }
      }
    }

    // Extras (Scan between batting and bowling headers roughly? Or just ignore for now if hard to find. We can safely set it to 0 or extract from headers)
    let extras = 0;
    // We can just find it in the whole file since there are only 2 innings.
    // Actually, we'll just set it to 0 and rely on the match total if needed.

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
    innings[0]?.batting.forEach((b) => squad1.push({ name: b.name, isCaptain: false, isWicketKeeper: false, exactRawName: b.name }));
    innings[1]?.batting.forEach((b) => squad2.push({ name: b.name, isCaptain: false, isWicketKeeper: false, exactRawName: b.name }));
  }

  // Determine which squad belongs to which team using the innings data
  // innings[0] is team1's batting, innings[1] is team2's batting
  if (innings.length >= 2 && squad1.length > 0 && squad2.length > 0) {
    const team1Batters = new Set(innings[0].batting.map(b => b.name));
    const team2Batters = new Set(innings[1].batting.map(b => b.name));
    
    // Count matches between squad1 and team1Batters vs team2Batters
    let squad1MatchTeam1 = 0;
    let squad1MatchTeam2 = 0;
    
    for (const p of squad1) {
       if (team1Batters.has(p.name)) squad1MatchTeam1++;
       if (team2Batters.has(p.name)) squad1MatchTeam2++;
    }
    
    // If squad1 players batted in innings[1] (team2), swap them!
    if (squad1MatchTeam2 > squad1MatchTeam1) {
       const temp = [...squad1];
       squad1.length = 0;
       squad1.push(...squad2);
       squad2.length = 0;
       squad2.push(...temp);
    }
  }

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
  [...scorecard.squad1, ...scorecard.squad2].forEach((p) => names.add(p.name));
  scorecard.innings.forEach((inn) => {
    inn.batting.forEach((b) => names.add(b.name));
    inn.bowling.forEach((b) => names.add(b.name));
  });
  return Array.from(names).filter(Boolean);
}
