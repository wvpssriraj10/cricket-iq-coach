// lib/name-matcher.ts
// Fuzzy player name matching for duplicate detection during PDF import

export type PlayerConflict = {
  pdfName: string;        // Name as it appears in the PDF
  existingId: string;     // ID of the potentially matching existing player
  existingName: string;   // Name of the existing player in DB
  similarity: number;     // 0–1 confidence score
};

/** Strip to uppercase letters only, sorted */
function initials(name: string): string[] {
  return name
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

/** Normalize a name to a comparable form */
export function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .replace(/\(.*?\)/g, "") // Remove parenthetical notes like (c), (wk)
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Get the surname (last token) */
function getSurname(parts: string[]): string {
  return parts[parts.length - 1] ?? "";
}

/** Get all non-surname initials */
function getNonSurnameInitials(parts: string[]): string[] {
  return parts.slice(0, -1);
}

/**
 * Determine if two names potentially refer to the same person.
 * Handles cases like:
 *  - "W Sriraj" vs "W V P S SRIRAJ"      → same surname, first initial matches
 *  - "Wvpssriraj" vs "W V P S Sriraj"    → concatenated initials vs spaced
 *  - Exact match after normalization
 */
export function arePotentiallyTheSamePerson(nameA: string, nameB: string): boolean {
  const a = normalizeName(nameA);
  const b = normalizeName(nameB);

  if (a === b) return true;

  // Remove spaces and compare (handles "Wvpssriraj" vs "W V P S SRIRAJ")
  if (a.replace(/\s+/g, "") === b.replace(/\s+/g, "")) return true;

  const partsA = initials(a);
  const partsB = initials(b);

  if (partsA.length === 0 || partsB.length === 0) return false;

  const surnameA = getSurname(partsA);
  const surnameB = getSurname(partsB);

  // Surnames must match (or one contains the other)
  if (surnameA !== surnameB) {
    if (surnameA.length === 1 || surnameB.length === 1) {
      // If one of the surnames is just an initial, they must share the same starting letter
      if (surnameA[0] !== surnameB[0]) return false;
    } else {
      if (!surnameA.includes(surnameB) && !surnameB.includes(surnameA)) return false;
    }
  }

  const initialsA = getNonSurnameInitials(partsA);
  const initialsB = getNonSurnameInitials(partsB);

  // If either has no non-surname parts, surnames matching is enough
  if (initialsA.length === 0 || initialsB.length === 0) return true;

  // Check if shorter initials list is a prefix/subset of longer
  const shorter = initialsA.length <= initialsB.length ? initialsA : initialsB;
  const longer = initialsA.length <= initialsB.length ? initialsB : initialsA;

  // Every initial in the shorter set must appear at start of longer set
  for (let i = 0; i < shorter.length; i++) {
    const s = shorter[i];
    const l = longer[i];
    if (!l) break;
    // Single char initial vs multi-char word: check first letter
    if (s.length === 1 && l.startsWith(s)) continue;
    if (l.length === 1 && s.startsWith(l)) continue;
    if (s !== l) return false;
  }

  return true;
}

/** Compute a similarity score 0–1 between two names */
export function nameSimilarity(nameA: string, nameB: string): number {
  const a = normalizeName(nameA);
  const b = normalizeName(nameB);

  if (a === b) return 1;
  if (a.replace(/\s+/g, "") === b.replace(/\s+/g, "")) return 0.95;

  if (!arePotentiallyTheSamePerson(nameA, nameB)) return 0;

  const partsA = initials(a);
  const partsB = initials(b);

  // More initials in common → higher score
  const shorter = partsA.length <= partsB.length ? partsA : partsB;
  const longer = partsA.length <= partsB.length ? partsB : partsA;
  const ratio = shorter.length / longer.length;

  return 0.6 + ratio * 0.35;
}

type ExistingPlayer = { id: string; name: string };

/**
 * Find conflicts between PDF player names and existing DB players.
 * Returns an array of potential matches for the user to resolve.
 * A conflict is only flagged if names are NOT an exact match (exact = reuse silently).
 */
export function findConflicts(
  pdfNames: string[],
  existingPlayers: ExistingPlayer[]
): PlayerConflict[] {
  const conflicts: PlayerConflict[] = [];

  for (const pdfName of pdfNames) {
    const normalizedPdf = normalizeName(pdfName);

    for (const existing of existingPlayers) {
      const normalizedExisting = normalizeName(existing.name);

      // We no longer skip exact matches, so that users are always prompted to confirm if an exact replica is the same person.
      if (arePotentiallyTheSamePerson(pdfName, existing.name)) {
        const score = nameSimilarity(pdfName, existing.name);
        // Avoid duplicate entries for same pdf name
        const alreadyFound = conflicts.find(
          (c) => c.pdfName === pdfName && c.existingId === existing.id
        );
        if (!alreadyFound) {
          conflicts.push({
            pdfName,
            existingId: existing.id,
            existingName: existing.name,
            similarity: score,
          });
        }
      }
    }
  }

  // Sort by similarity descending
  conflicts.sort((a, b) => b.similarity - a.similarity);

  return conflicts;
}
