"use client";

import { notify } from "@/lib/toast";
import { useEffect, useRef, useState } from "react";
import { motion, animate as tween } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEngine } from "@/store/engine";
import { useAuth } from "./AuthProvider";
import { saveTestResult } from "@/lib/firestore";
import { Oscilloscope } from "./Oscilloscope";
import { Panel } from "./Panel";

export function Results() {
  const { status, results, mode, config, restart, resultSaved, markResultSaved } = useEngine();
  const { user, configured } = useAuth();
  const [saved, setSaved] = useState(resultSaved);
  const [isNewBest, setIsNewBest] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const savingRef = useRef(resultSaved);

  const rootRef = useRef<HTMLDivElement>(null);
  const wpmRef = useRef<HTMLSpanElement>(null);
  const accRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // resultSaved lives in the store (not a local ref) so it survives a
    // remount — e.g. navigating to /leaderboard and back to a still-"finished"
    // result — without re-firing the save and writing a duplicate history doc.
    if (status !== "finished" || !results || !user || savingRef.current) return;
    savingRef.current = true;
    saveTestResult(
      user.uid,
      user.displayName ?? "racer",
      {
        mode,
        config,
        wpm: results.wpm,
        wpmNet: results.wpmNet,
        accuracy: results.accuracy,
        consistency: results.consistency,
        charStats: results.charStats,
        wpmTimeline: results.wpmTimeline,
        elapsedSeconds: results.elapsedSeconds,
      },
      user.photoURL ?? null
    )
      .then(({ isNewBest, xpGained }) => {
        setSaved(true);
        setIsNewBest(isNewBest);
        setXpGained(xpGained);
        markResultSaved();
        if (isNewBest) notify.success("New personal best", `${results.wpmNet} wpm${xpGained ? ` · +${xpGained} xp` : ""}`);
        else if (xpGained > 0) notify.success("Result saved", `+${xpGained} xp`);
      })
      .catch(() => {
        notify.error("Couldn't save result", "Check your connection and try another run.");
        setSaved(false);
        savingRef.current = false;
      });
  }, [status, results, user, mode, config, markResultSaved]);

  // The one orchestrated moment in the app: WPM and accuracy count up,
  // the graph draws itself in (handled inside Oscilloscope), and a new
  // personal best gets a one-time underline flourish. Everywhere else in
  // the app, motion stays instant and functional — this is the payoff.
  // Count-up for WPM and accuracy, once per finished result.
  useEffect(() => {
    if (status !== "finished" || !results) return;
    const wpmEl = wpmRef.current;
    const accEl = accRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (wpmEl) wpmEl.textContent = String(results.wpmNet);
      if (accEl) accEl.textContent = String(results.accuracy);
      return;
    }
    const controls = tween(0, 1, {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (p) => {
        if (wpmEl) wpmEl.textContent = String(Math.round(results.wpmNet * p));
        if (accEl) accEl.textContent = String(Math.round(results.accuracy * p));
      },
    });
    return () => controls.stop();
  }, [status, results]);

  if (status !== "finished" || !results) return null;

  const peak = results.wpmTimeline.length ? Math.max(...results.wpmTimeline) : results.wpm;

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full max-w-3xl mx-auto text-text"
    >
      <Panel className="px-6 pt-6 pb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-sub">Speed over time</span>
          <span className="text-sm text-sub tabular-nums">
            Peak <span className="font-semibold text-main">{peak}</span>
          </span>
        </div>
        <Oscilloscope samples={results.wpmTimeline} height={120} strokeWidth={2} animate />
      </Panel>

      <Panel className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-sub/15">
        <div className="px-6 py-5 min-w-0">
          <div className="text-sm text-sub">WPM</div>
          <div
            className="font-display text-main font-bold leading-none mt-1 tabular-nums"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            <span ref={wpmRef}>0</span>
          </div>
          {isNewBest && (
            <div className="mt-2 flex items-center gap-1">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
                style={{ originX: 0 }}
                className="block h-0.5 w-4 rounded-full bg-main"
              />
              <span className="text-sm font-semibold text-main">Personal best</span>
            </div>
          )}
        </div>
        <div className="px-6 py-5 min-w-0">
          <div className="text-sm text-sub">Accuracy</div>
          <div
            className="font-display text-main font-bold leading-none mt-1 tabular-nums"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            <span ref={accRef}>0</span>%
          </div>
        </div>
        <div className="px-6 py-5 min-w-0 flex flex-col justify-center gap-3 text-sm text-sub">
          <div className="flex items-center justify-between gap-4">
            <span>Consistency</span>
            <span className="text-text tabular-nums shrink-0">{results.consistency}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Raw WPM</span>
            <span className="text-text tabular-nums shrink-0">{results.wpm}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span>Correct / incorrect / extra / missed</span>
            <span className="text-text tabular-nums">
              {results.charStats.correct} / {results.charStats.incorrect} / {results.charStats.extra} /{" "}
              {results.charStats.missed}
            </span>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-4 text-sm text-sub">
        <button
          onClick={restart}
          className="group flex items-center gap-2 rounded-xl bg-main px-5 py-2.5 text-sm font-semibold text-bg transition-[filter] hover:brightness-110"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Restart (shift + enter)
        </button>
        {!configured && <span>Guest mode. Sign in to save your history.</span>}
        {configured && !user && <span>Sign in to save this result</span>}
        {configured && user && (
          <span>
            {saved ? "Saved to history" : "Saving..."}
            {saved && xpGained > 0 && <span className="text-main"> · +{xpGained} xp</span>}
          </span>
        )}
      </div>
    </motion.div>
  );
}
