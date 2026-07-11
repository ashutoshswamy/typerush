"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { getLeaderboard, configKey, type LeaderboardEntry, type TestMode } from "@/lib/firestore";
import { levelFromXp } from "@/lib/xp";
import { Panel } from "@/components/Panel";
import { SignalBar } from "@/components/SignalBar";
import { Avatar } from "@/components/Avatar";
import { fadeUp, staggerContainer } from "@/lib/motion";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];

function LeaderboardTable({ mode, size }: { mode: TestMode; size: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = configKey(mode, {
      duration: mode === "time" ? size : undefined,
      wordCount: mode === "words" ? size : undefined,
      punctuation: false,
      numbers: false,
      language: "english",
    });
    getLeaderboard(key)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [mode, size]);

  const max = Math.max(...entries.map((e) => e.wpm), 1);
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  // Podium reads left-to-right as 2nd / 1st / 3rd, like a real podium — 1st
  // gets the tall center block, matching the "top signal readings" framing.
  const podiumOrder = [podium[1], podium[0], podium[2]];

  if (loading) {
    return (
      <Panel className="font-test flex flex-col text-sm">
        <p className="text-sub text-xs tracking-[0.1em] uppercase py-4 px-4">reading…</p>
      </Panel>
    );
  }

  if (entries.length === 0) {
    return (
      <Panel className="font-test flex flex-col text-sm">
        <p className="text-sub text-xs tracking-[0.1em] uppercase py-4 px-4">no entries yet</p>
      </Panel>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3 items-end">
        {podiumOrder.map((e, slot) => {
          if (!e) return <div key={slot} />;
          const rank = entries.indexOf(e) + 1;
          const isFirst = rank === 1;
          return (
            <motion.div key={e.uid} variants={fadeUp}>
              <Panel
                accent={isFirst ? "var(--main)" : undefined}
                className={`font-test flex flex-col items-center gap-2 px-3 text-center ${
                  isFirst ? "py-6" : "py-4 opacity-80"
                }`}
              >
                <span
                  className={`flex items-center justify-center ${isFirst ? "text-main" : "text-sub"}`}
                  aria-hidden="true"
                >
                  {isFirst ? <Trophy size={20} /> : <span className="text-xs tabular-nums">{String(rank).padStart(2, "0")}</span>}
                </span>
                <Avatar src={e.photoURL} label={e.username} size={isFirst ? 52 : 40} />
                <Link
                  href={`/profile/${e.username}`}
                  className={`truncate max-w-full hover:text-main transition-colors ${isFirst ? "text-text text-base" : "text-sub text-sm"}`}
                >
                  {e.username}
                </Link>
                <span className={`font-display tabular-nums leading-none ${isFirst ? "text-3xl text-main" : "text-xl text-text"}`}>
                  {e.wpm}
                </span>
                <span className="text-sub text-[10px] tracking-[0.15em] uppercase">wpm</span>
                <span className="text-main text-[10px] tracking-[0.1em] uppercase tabular-nums">lv {levelFromXp(e.xp ?? 0)}</span>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <Panel className="font-test flex flex-col text-sm">
          {rest.map((e, i) => (
            <motion.div
              key={e.uid}
              variants={fadeUp}
              className="flex items-center gap-4 px-4 py-3 border-b border-sub/15 last:border-b-0 text-text"
            >
              <span className="flex items-center justify-center w-8 text-xs tabular-nums text-sub">
                {String(i + 4).padStart(2, "0")}
              </span>
              <Avatar src={e.photoURL} label={e.username} size={28} />
              <Link href={`/profile/${e.username}`} className="flex-1 hover:text-main transition-colors">
                {e.username}
              </Link>
              <span className="text-main text-[10px] tracking-[0.1em] uppercase tabular-nums w-12 text-right shrink-0">
                lv {levelFromXp(e.xp ?? 0)}
              </span>
              <div className="w-24 hidden sm:block">
                <SignalBar value={e.wpm} max={max} />
              </div>
              <span className="tabular-nums w-20 text-right">{e.wpm} wpm</span>
            </motion.div>
          ))}
        </Panel>
      )}
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const [mode, setMode] = useState<TestMode>("time");
  const [size, setSize] = useState(30);
  const sizeOptions = mode === "time" ? TIME_OPTIONS : WORD_OPTIONS;

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex flex-col gap-8 max-w-3xl mx-auto py-14 w-full">
      <motion.div variants={fadeUp}>
        <p className="font-test text-[10px] tracking-[0.3em] uppercase text-sub mb-1">top signal readings</p>
        <h1 className="font-display text-3xl text-text tracking-tight">Leaderboard</h1>
      </motion.div>

      <motion.div variants={fadeUp} className="w-fit self-start">
        <Panel className="flex flex-wrap gap-5 text-xs tracking-[0.15em] uppercase text-sub px-5 py-3">
          {(["time", "words"] as TestMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setSize(m === "time" ? 30 : 25);
              }}
              className={mode === m ? "text-main" : "hover:text-text transition-colors"}
            >
              {m}
            </button>
          ))}
          <span className="w-px h-4 bg-sub/40" />
          {sizeOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={size === s ? "text-main" : "hover:text-text transition-colors"}
            >
              {s}
            </button>
          ))}
        </Panel>
      </motion.div>

      <LeaderboardTable key={`${mode}-${size}`} mode={mode} size={size} />
    </motion.div>
  );
}
