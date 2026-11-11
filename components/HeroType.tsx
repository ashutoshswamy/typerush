"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { EASE } from "@/lib/motion";
import { TriggerButton } from "./TriggerButton";

// The headline is the test: type it where it stands. Line 1 is neutral,
// line 2 carries the accent. Fixed string, so SSR and client agree.
const LINE_1 = "Type fast.";
const LINE_2 = "Race friends.";
const TARGET = `${LINE_1} ${LINE_2}`;
const BREAK_AT = LINE_1.length; // index of the space that becomes a line break

export function HeroType() {
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<number | null>(null);
  const keysRef = useRef({ total: 0, wrong: 0 });
  const done = value.length === TARGET.length;

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value.slice(0, TARGET.length);
    if (startRef.current === null && next.length > 0) startRef.current = performance.now();
    if (next.length > value.length) {
      const i = next.length - 1;
      keysRef.current.total += 1;
      if (next[i] !== TARGET[i]) keysRef.current.wrong += 1;
    }
    let correct = 0;
    for (let i = 0; i < next.length; i++) if (next[i] === TARGET[i]) correct++;
    const minutes = startRef.current ? Math.max((performance.now() - startRef.current) / 60000, 1 / 600) : 0;
    setWpm(minutes ? Math.round(correct / 5 / minutes) : 0);
    const { total, wrong } = keysRef.current;
    setAccuracy(total ? Math.round(((total - wrong) / total) * 100) : 100);
    setValue(next);
  }

  function reset() {
    startRef.current = null;
    keysRef.current = { total: 0, wrong: 0 };
    setValue("");
    setWpm(0);
    setAccuracy(100);
    inputRef.current?.focus();
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl min-h-[calc(100dvh-8rem)] flex-col justify-center gap-10 px-4 py-10 sm:gap-14">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <h1
          aria-label={TARGET}
          className="font-display text-[clamp(3.25rem,11vw,9.5rem)] font-extrabold leading-[0.98] tracking-tight select-none"
        >
          {TARGET.split("").map((ch, i) => {
            if (i === BREAK_AT) return <br key={i} />;
            const typedCh = value[i];
            const accent = i > BREAK_AT;
            const cls =
              typedCh === undefined
                ? accent
                  ? "text-main/55"
                  : "text-text/45"
                : typedCh === ch
                  ? accent
                    ? "text-main"
                    : "text-text"
                  : "text-error";
            return (
              <span key={i} aria-hidden="true" className={`relative transition-colors duration-100 ${cls}`}>
                {ch}
                {focused && !done && value.length === i && (
                  <span className="absolute inset-y-[0.12em] -left-[0.03em] w-[0.05em] rounded-full bg-caret animate-pulse" />
                )}
              </span>
            );
          })}
        </h1>
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={done}
          maxLength={TARGET.length}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Type the headline to try a quick speed test"
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
        className="grid items-end gap-8 lg:grid-cols-[1fr_auto]"
      >
        <div className="flex flex-col items-start gap-6">
          <p className="max-w-md text-lg leading-relaxed text-text/65 sm:text-xl">
            A free typing speed test with live WPM, 1v1 races against friends, and a global leaderboard.
          </p>
          <TriggerButton href="/type">Start typing</TriggerButton>
        </div>

        <div className="flex min-h-24 flex-col gap-2 lg:items-end">
          <div className="flex items-baseline gap-5">
            <span className="font-display text-7xl font-extrabold leading-none tabular-nums text-main sm:text-8xl">
              {wpm}
              <span className="ml-2 text-xl font-semibold text-text/65">wpm</span>
            </span>
            <span className="font-display text-3xl font-bold tabular-nums text-text">
              {accuracy}
              <span className="text-lg text-text/65">%</span>
            </span>
          </div>
          {done ? (
            <button
              onClick={reset}
              className="flex w-fit items-center gap-2 rounded-xl border border-sub/40 px-4 py-2 text-sm font-medium text-text transition-colors hover:border-main hover:text-main"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Try again
            </button>
          ) : (
            <p className="text-sm text-text/65">{focused || value ? "Keep going." : "Click the headline and type it."}</p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
