"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
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
  const pbRef = useRef<HTMLSpanElement>(null);

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
      })
      .catch(() => {
        setSaved(false);
        savingRef.current = false;
      });
  }, [status, results, user, mode, config, markResultSaved]);

  // The one orchestrated moment in the app: WPM and accuracy count up,
  // the graph draws itself in (handled inside Oscilloscope), and a new
  // personal best gets a one-time underline flourish. Everywhere else in
  // the app, motion stays instant and functional — this is the payoff.
  useGSAP(
    () => {
      if (status !== "finished" || !results) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        if (wpmRef.current) wpmRef.current.textContent = String(results.wpmNet);
        if (accRef.current) accRef.current.textContent = String(results.accuracy);
        return;
      }

      const counters = { wpm: 0, acc: 0 };
      gsap.to(counters, {
        wpm: results.wpmNet,
        acc: results.accuracy,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          if (wpmRef.current) wpmRef.current.textContent = String(Math.round(counters.wpm));
          if (accRef.current) accRef.current.textContent = String(Math.round(counters.acc));
        },
      });
    },
    { dependencies: [status, results?.wpmNet, results?.accuracy], scope: rootRef }
  );

  useGSAP(
    () => {
      if (!isNewBest || !pbRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      gsap.fromTo(
        pbRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.4, ease: "power2.out", transformOrigin: "left", delay: 0.9 }
      );
    },
    { dependencies: [isNewBest], scope: rootRef }
  );

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
          <span className="font-test text-[10px] tracking-[0.25em] uppercase text-sub">wpm trace</span>
          <span className="font-test text-[10px] tracking-[0.15em] uppercase text-sub tabular-nums">
            peak <span className="text-main">{peak}</span>
          </span>
        </div>
        <Oscilloscope samples={results.wpmTimeline} height={120} strokeWidth={2} animate />
      </Panel>

      <Panel className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-sub/15">
        <div className="px-6 py-5 min-w-0">
          <div className="font-test text-sub text-xs tracking-[0.15em] uppercase">wpm</div>
          <div
            className="font-display text-main font-bold leading-none mt-1 tabular-nums"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            <span ref={wpmRef}>0</span>
          </div>
          {isNewBest && (
            <div className="mt-2 flex items-center gap-1">
              <span
                ref={pbRef}
                className="block h-[2px] w-4 bg-main"
                style={{ boxShadow: "0 0 6px var(--main)" }}
              />
              <span className="font-test text-main text-[10px] tracking-[0.15em] uppercase">personal best</span>
            </div>
          )}
        </div>
        <div className="px-6 py-5 min-w-0">
          <div className="font-test text-sub text-xs tracking-[0.15em] uppercase">accuracy</div>
          <div
            className="font-display text-main font-bold leading-none mt-1 tabular-nums"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            <span ref={accRef}>0</span>%
          </div>
        </div>
        <div className="font-test px-6 py-5 min-w-0 flex flex-col justify-center gap-2.5 text-xs tracking-[0.1em] uppercase text-sub">
          <div className="flex items-center justify-between gap-4">
            <span>consistency</span>
            <span className="text-text tabular-nums shrink-0">{results.consistency}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>raw</span>
            <span className="text-text tabular-nums shrink-0">{results.wpm}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span>correct / incorrect / extra / missed</span>
            <span className="text-text tabular-nums">
              {results.charStats.correct} / {results.charStats.incorrect} / {results.charStats.extra} /{" "}
              {results.charStats.missed}
            </span>
          </div>
        </div>
      </Panel>

      <div className="font-test flex items-center gap-4 text-xs tracking-[0.1em] uppercase text-sub">
        <button
          onClick={restart}
          className="group flex items-center gap-2 border-2 border-main px-4 py-2 text-main transition-colors hover:bg-main hover:text-bg"
        >
          <RotateCcw size={13} aria-hidden="true" />
          restart — shift+enter
        </button>
        {!configured && <span>guest mode — sign in to save history</span>}
        {configured && !user && <span>sign in to save this result</span>}
        {configured && user && (
          <span>
            {saved ? "saved to history" : "saving…"}
            {saved && xpGained > 0 && <span className="text-main"> · +{xpGained} xp</span>}
          </span>
        )}
      </div>
    </motion.div>
  );
}
