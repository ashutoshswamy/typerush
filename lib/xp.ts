// Award formula: flat completion XP + a performance bonus so finishing fast
// and clean earns more than just finishing. Level curve is sqrt-shaped
// (xpForLevel(n) = 100 * n^1.5) so each level costs a bit more than the last.
export function xpForResult(wpmNet: number, accuracy: number): number {
  const base = 20;
  const wpmBonus = Math.floor(Math.max(wpmNet, 0) / 2);
  const accBonus = accuracy >= 98 ? 10 : accuracy >= 90 ? 5 : 0;
  return base + wpmBonus + accBonus;
}

// Cumulative xp required to REACH a level (level 1 starts at 0xp).
// Per-level cost: 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 525, ...
// — +25 each level within a band of 5, then the step itself grows by
// another 25 once you cross into the next band (level 6, 11, 16, ...).
export function xpForLevel(level: number): number {
  let total = 0;
  let cost = 100;
  for (let n = 1; n < level; n++) {
    total += cost;
    cost += 25 * (Math.floor(n / 5) + 1);
  }
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export interface XpProgress {
  level: number;
  into: number; // xp earned since hitting current level
  need: number; // xp required to reach next level from current level
}

export function xpProgress(xp: number): XpProgress {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, into: xp - floor, need: ceil - floor };
}
