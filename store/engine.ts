import { create } from "zustand";
import { generateWords, type WordTier } from "@/lib/wordgen";
import { netWpm, rawWpm, accuracy, type CharStats } from "@/lib/wpm";
import { consistency } from "@/lib/consistency";
import type { TestMode, TestConfig } from "@/lib/firestore";

export type EngineStatus = "idle" | "running" | "finished";

export interface EngineResults {
  wpm: number;
  wpmNet: number;
  accuracy: number;
  consistency: number;
  charStats: CharStats;
  wpmTimeline: number[];
  elapsedSeconds: number;
}

interface EngineState {
  mode: TestMode;
  config: TestConfig;
  wordTier: WordTier;
  fixedWordList: boolean; // race mode: words[] is shared with the opponent, never top up the buffer
  words: string[];
  typed: string[]; // locked-in typed text per completed/current word
  wordIndex: number;
  status: EngineStatus;
  startedAt: number | null; // performance.now()
  elapsedMs: number;
  correctKeystrokes: number;
  totalKeystrokes: number;
  charStats: CharStats;
  wpmTimeline: number[];
  lastSampleMs: number; // elapsedMs at the last wpmTimeline sample
  lastSampleChars: number; // cumulative typed chars at the last sample
  results: EngineResults | null;
  resultSaved: boolean; // guards against re-saving the same result on remount (e.g. nav away and back)

  configure: (mode: TestMode, config: TestConfig, wordTier?: WordTier, fixedWords?: string[]) => void;
  type: (ch: string) => void;
  backspace: () => void;
  tick: () => void;
  finish: () => void;
  restart: () => void;
  markResultSaved: () => void;
}

const WORD_BUFFER = 60;

function freshWords(count: number, config: TestConfig, tier: WordTier): string[] {
  return generateWords(count, {
    tier,
    punctuation: config.punctuation,
    numbers: config.numbers,
  });
}

export const useEngine = create<EngineState>((set, get) => ({
  mode: "time",
  config: { duration: 30, punctuation: false, numbers: false, language: "english" },
  wordTier: 200,
  fixedWordList: false,
  // Empty on init, not a random buffer — generating words at module scope
  // runs once during SSR and again on client hydration with a different
  // Math.random() sequence, which mismatches the server-rendered word spans.
  // TestArea populates the real buffer client-side on mount instead.
  words: [],
  typed: [""],
  wordIndex: 0,
  status: "idle",
  startedAt: null,
  elapsedMs: 0,
  correctKeystrokes: 0,
  totalKeystrokes: 0,
  charStats: { correct: 0, incorrect: 0, extra: 0, missed: 0 },
  wpmTimeline: [],
  lastSampleMs: 0,
  lastSampleChars: 0,
  results: null,
  resultSaved: false,

  configure: (mode, config, wordTier = 200, fixedWords) => {
    // A race lobby hands both racers the same word[] up front — the mode
    // (time/words) stays whatever the host picked, but the buffer is fixed
    // and never topped up, so both racers see identical words start to end.
    const effectiveConfig = fixedWords && mode === "words" ? { ...config, wordCount: fixedWords.length } : config;
    const count = effectiveConfig.wordCount ? Math.max(effectiveConfig.wordCount, WORD_BUFFER) : WORD_BUFFER;
    set({
      mode,
      config: effectiveConfig,
      wordTier,
      fixedWordList: Boolean(fixedWords),
      words: fixedWords ?? freshWords(count, effectiveConfig, wordTier),
      typed: [""],
      wordIndex: 0,
      status: "idle",
      startedAt: null,
      elapsedMs: 0,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
      charStats: { correct: 0, incorrect: 0, extra: 0, missed: 0 },
      wpmTimeline: [],
      lastSampleMs: 0,
      lastSampleChars: 0,
      results: null,
      resultSaved: false,
    });
  },

  type: (ch: string) => {
    const s = get();
    if (s.status === "finished") return;

    const now = performance.now();
    const startedAt = s.status === "idle" ? now : s.startedAt;
    const target = s.words[s.wordIndex] ?? "";
    const currentTyped = s.typed[s.wordIndex] ?? "";

    if (ch === " ") {
      if (currentTyped.length === 0) return; // ignore leading spaces
      // score the completed word against target
      let correct = 0, incorrect = 0, extra = 0, missed = 0;
      const len = Math.max(target.length, currentTyped.length);
      for (let i = 0; i < len; i++) {
        const t = target[i];
        const c = currentTyped[i];
        if (t === undefined) extra++;
        else if (c === undefined) missed++;
        else if (t === c) correct++;
        else incorrect++;
      }

      const nextTyped = [...s.typed, ""];
      const nextWordIndex = s.wordIndex + 1;
      let nextWords = s.words;
      if (!s.fixedWordList && s.mode !== "words" && nextWordIndex > s.words.length - 20) {
        nextWords = [...s.words, ...freshWords(WORD_BUFFER, s.config, s.wordTier)];
      }

      set({
        typed: nextTyped,
        wordIndex: nextWordIndex,
        words: nextWords,
        status: "running",
        startedAt,
        charStats: {
          correct: s.charStats.correct + correct,
          incorrect: s.charStats.incorrect + incorrect,
          extra: s.charStats.extra + extra,
          missed: s.charStats.missed + missed,
        },
        correctKeystrokes: s.correctKeystrokes + 1, // space itself counted as a correct keystroke
        totalKeystrokes: s.totalKeystrokes + 1,
      });

      if (s.mode === "words" && nextWordIndex >= (s.config.wordCount ?? Infinity)) {
        get().finish();
      }
      return;
    }

    const nextTyped = [...s.typed];
    nextTyped[s.wordIndex] = currentTyped + ch;
    const isCorrect = target[currentTyped.length] === ch;

    set({
      typed: nextTyped,
      status: "running",
      startedAt,
      correctKeystrokes: s.correctKeystrokes + (isCorrect ? 1 : 0),
      totalKeystrokes: s.totalKeystrokes + 1,
    });
  },

  backspace: () => {
    const s = get();
    if (s.status === "finished") return;
    const currentTyped = s.typed[s.wordIndex] ?? "";
    if (currentTyped.length === 0) {
      if (s.wordIndex === 0) return;
      // move back into previous word (only if it had extra/incorrect chars left to fix)
      return;
    }
    const nextTyped = [...s.typed];
    nextTyped[s.wordIndex] = currentTyped.slice(0, -1);
    set({ typed: nextTyped });
  },

  tick: () => {
    const s = get();
    if (s.status !== "running" || s.startedAt === null) return;
    const now = performance.now();
    const elapsedMs = now - s.startedAt;
    const elapsedSeconds = elapsedMs / 1000;

    const typedSoFar = s.typed.reduce((sum, w) => sum + w.length, 0) + s.wordIndex; // + spaces

    // Sample once per elapsed second, and only over that second's delta —
    // a cumulative-average sample barely moves once the run is long, which
    // hides real bursts/slowdowns and skews the consistency score.
    //
    // tick() is rAF-driven, and a backgrounded/throttled tab can starve it
    // for several seconds — catch up one second at a time (splitting the
    // gap's chars evenly) instead of folding the whole gap into one
    // oversized sample, so the timeline keeps its one-sample-per-second
    // shape that the graph and consistency score assume.
    let wpmTimeline = s.wpmTimeline;
    let lastSampleMs = s.lastSampleMs;
    let lastSampleChars = s.lastSampleChars;
    while (elapsedMs - lastSampleMs >= 1000) {
      const secondsInGap = Math.floor((elapsedMs - lastSampleMs) / 1000);
      const charsPerSecond = (typedSoFar - lastSampleChars) / secondsInGap;
      wpmTimeline = [...wpmTimeline, rawWpm(charsPerSecond, 1)];
      lastSampleMs += 1000;
      lastSampleChars += charsPerSecond;
    }

    set({ elapsedMs, wpmTimeline, lastSampleMs, lastSampleChars });

    if (s.mode === "time" && elapsedSeconds >= (s.config.duration ?? Infinity)) {
      get().finish();
    }
  },

  finish: () => {
    const s = get();
    if (s.status === "finished" || s.startedAt === null) return;
    const elapsedSeconds = Math.max((performance.now() - s.startedAt) / 1000, 0.001);

    const currentTyped = s.typed[s.wordIndex] ?? "";
    const target = s.words[s.wordIndex] ?? "";
    let correct = 0, incorrect = 0, extra = 0, missed = 0;
    if (currentTyped.length > 0) {
      const len = Math.max(target.length, currentTyped.length);
      for (let i = 0; i < len; i++) {
        const t = target[i];
        const c = currentTyped[i];
        if (t === undefined) extra++;
        else if (c === undefined) missed++;
        else if (t === c) correct++;
        else incorrect++;
      }
    }

    const finalCharStats: CharStats = {
      correct: s.charStats.correct + correct,
      incorrect: s.charStats.incorrect + incorrect,
      extra: s.charStats.extra + extra,
      missed: s.charStats.missed + missed,
    };

    const results: EngineResults = {
      wpm: rawWpm(finalCharStats.correct + finalCharStats.incorrect + finalCharStats.extra, elapsedSeconds),
      wpmNet: netWpm(finalCharStats.correct, finalCharStats.incorrect, elapsedSeconds),
      accuracy: accuracy(s.correctKeystrokes, s.totalKeystrokes || 1),
      consistency: consistency(s.wpmTimeline),
      charStats: finalCharStats,
      wpmTimeline: s.wpmTimeline,
      elapsedSeconds,
    };

    set({ status: "finished", charStats: finalCharStats, results });
  },

  restart: () => {
    const s = get();
    get().configure(s.mode, s.config, s.wordTier);
  },

  markResultSaved: () => set({ resultSaved: true }),
}));
