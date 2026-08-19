export function markPercent(mark, maxMark) {
  if (mark == null) return null;
  if (!maxMark) return 0;
  return (mark / maxMark) * 100;
}

/**
 * Weighted final percentage for a student across a set of assessments.
 * - ABSENT   -> counts as 0%
 * - MISSING  -> excluded (ignored)
 * - GRADED / unmarked (null mark) -> excluded until filled
 * Returns null when nothing is countable (den == 0).
 */
export function weightedFinalPercent(assessments, cellsById) {
  let num = 0;
  let den = 0;
  for (const a of assessments) {
    const cell = cellsById ? cellsById[a.id] : null;
    if (!cell) continue;
    let pct;
    if (cell.status === "ABSENT") pct = 0;
    else if (cell.status === "MISSING") continue;
    else if (cell.mark == null) continue;
    else pct = markPercent(cell.mark, a.maxMark) ?? 0;
    num += pct * a.weight;
    den += a.weight;
  }
  if (den === 0) return null;
  return Math.round((num / den) * 10) / 10;
}

export function letterForPercent(p) {
  if (p == null) return null;
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  return "F";
}