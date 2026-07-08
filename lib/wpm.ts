export interface CharStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export function netWpm(correctChars: number, incorrectChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const raw = (correctChars / 5 - incorrectChars) / (elapsedSeconds / 60);
  return Math.max(0, Math.round(raw));
}

export function rawWpm(allTypedChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.max(0, Math.round(allTypedChars / 5 / (elapsedSeconds / 60)));
}

export function accuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  return Math.round((correctKeystrokes / totalKeystrokes) * 10000) / 100;
}
