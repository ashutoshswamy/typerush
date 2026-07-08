import { COMMON_WORDS } from "./wordlist";

export type WordTier = 200 | 1000 | 5000;

export interface WordGenOptions {
  tier?: WordTier;
  punctuation?: boolean;
  numbers?: boolean;
}

const PUNCTUATION_MARKS = [".", ",", "!", "?", ";"];

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function tierPool(tier: WordTier): readonly string[] {
  // ponytail: only ~200 unique words available; larger tiers cycle the same pool.
  return COMMON_WORDS.slice(0, Math.min(tier, COMMON_WORDS.length));
}

function decorate(word: string, options: WordGenOptions): string {
  let out = word;
  if (options.numbers && randInt(10) === 0) {
    out = String(randInt(1000));
  }
  if (options.punctuation && randInt(8) === 0) {
    out += PUNCTUATION_MARKS[randInt(PUNCTUATION_MARKS.length)];
    if (randInt(2) === 0) out = out[0].toUpperCase() + out.slice(1);
  }
  return out;
}

export function generateWords(count: number, options: WordGenOptions = {}): string[] {
  const pool = tierPool(options.tier ?? 200);
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(decorate(pool[randInt(pool.length)], options));
  }
  return words;
}
