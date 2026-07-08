// Consistency = inverted, normalized coefficient of variation of per-second raw WPM.
// Lower stddev/mean (CoV) => higher displayed score. There's no single industry
// standard for this stat — this approximates Monkeytype's approach, the closest
// thing to a convention. Treat it as "an approximation of typing steadiness,"
// not a verified match to any specific product's number.
export function consistency(rawWpmSamples: number[]): number {
  if (rawWpmSamples.length < 2) return 100;
  const mean = rawWpmSamples.reduce((a, b) => a + b, 0) / rawWpmSamples.length;
  if (mean === 0) return 100;
  const variance =
    rawWpmSamples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / rawWpmSamples.length;
  const stddev = Math.sqrt(variance);
  const cov = stddev / mean;
  const score = 100 * (1 - Math.min(cov, 1));
  return Math.round(score);
}
