"use client";

import { motion } from "framer-motion";
import { Quote, Hash, Timer, Type, Leaf } from "lucide-react";
import { useEngine } from "@/store/engine";
import type { TestMode } from "@/lib/firestore";
import { Checkbox } from "./Checkbox";

const DURATIONS = [15, 30, 60, 120];
const WORD_COUNTS = [10, 25, 50, 100];

const MODE_ICON: Record<TestMode, typeof Timer> = {
  time: Timer,
  words: Type,
  quote: Quote,
  zen: Leaf,
};

export function ConfigBar() {
  const { mode, config, configure, status } = useEngine();
  const disabled = status === "running";

  function setMode(m: TestMode) {
    if (m === "time") configure(m, { ...config, duration: config.duration ?? 30 });
    else if (m === "words") configure(m, { ...config, wordCount: config.wordCount ?? 25 });
    else configure(m, config);
  }

  return (
    <motion.div
      animate={{ opacity: disabled ? 0.2 : 1 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-wrap items-center justify-center gap-5 text-xs tracking-[0.15em] uppercase text-sub ${
        disabled ? "pointer-events-none" : ""
      }`}
    >
      <label className="flex items-center gap-1.5 cursor-pointer">
        <Checkbox
          checked={config.punctuation}
          onChange={(e) => configure(mode, { ...config, punctuation: e.target.checked })}
        />
        <Quote size={13} aria-hidden="true" />
        punctuation
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <Checkbox
          checked={config.numbers}
          onChange={(e) => configure(mode, { ...config, numbers: e.target.checked })}
        />
        <Hash size={13} aria-hidden="true" />
        numbers
      </label>

      <span className="w-px h-4 bg-sub/40" />

      {(["time", "words", "quote", "zen"] as TestMode[]).map((m) => {
        const Icon = MODE_ICON[m];
        return (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 ${mode === m ? "text-main" : "hover:text-text"}`}
          >
            <Icon size={13} aria-hidden="true" />
            {m}
          </button>
        );
      })}

      <span className="w-px h-4 bg-sub/40" />

      {mode === "time" &&
        DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => configure(mode, { ...config, duration: d })}
            className={config.duration === d ? "text-main" : "hover:text-text"}
          >
            {d}
          </button>
        ))}
      {mode === "words" &&
        WORD_COUNTS.map((c) => (
          <button
            key={c}
            onClick={() => configure(mode, { ...config, wordCount: c })}
            className={config.wordCount === c ? "text-main" : "hover:text-text"}
          >
            {c}
          </button>
        ))}
    </motion.div>
  );
}
