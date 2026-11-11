"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { getLeaderboard, configKey, type LeaderboardEntry, type TestMode } from "@/lib/firestore";
import { levelFromXp } from "@/lib/xp";
import { Panel } from "@/components/Panel";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { fadeUp, staggerContainer } from "@/lib/motion";

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-main text-bg" : "text-sub hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

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

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading leaderboard">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface h-16 animate-pulse opacity-60" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Panel className="flex flex-col items-start gap-2 p-8">
        <p className="font-display text-2xl font-bold text-text">No scores here yet</p>
        <p className="text-sub">Be the first to set one.</p>
        <Link href="/type" className="mt-3 rounded-xl bg-main px-5 py-2.5 text-sm font-semibold text-bg hover:brightness-110 transition-[filter]">
          Take a test
        </Link>
      </Panel>
    );
  }

  const [first, ...rest] = entries;

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex flex-col gap-3">
      <motion.div variants={fadeUp}>
        <Link
          href={`/profile/${first.username}`}
          className="flex flex-wrap items-center gap-5 rounded-[1.25rem] border border-main/30 bg-main/12 p-6 sm:p-8 transition-colors hover:border-main/60"
        >
          <Avatar src={first.photoURL} label={first.username} size={64} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-main">
              <Crown size={15} aria-hidden="true" /> Top typist
            </p>
            <p className="font-display truncate text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
              {first.username}
            </p>
            <p className="text-sm text-sub">Level {levelFromXp(first.xp ?? 0)}</p>
          </div>
          <p className="font-display text-6xl sm:text-7xl font-extrabold leading-none tabular-nums text-main">
            {first.wpm}
            <span className="ml-2 text-lg font-semibold text-sub">wpm</span>
          </p>
        </Link>
      </motion.div>

      {rest.map((e, i) => (
        <motion.div key={e.uid} variants={fadeUp}>
          <Link
            href={`/profile/${e.username}`}
            className="surface flex items-center gap-2.5 px-3 py-3.5 sm:gap-4 sm:px-5 transition-colors hover:border-main/50"
          >
            <span className="w-7 text-center font-display text-lg font-bold tabular-nums text-sub">{i + 2}</span>
            <Avatar src={e.photoURL} label={e.username} size={36} />
            <span className="min-w-0 flex-1 truncate font-medium text-text">{e.username}</span>
            <span className="rounded-full bg-main/12 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-main">
              Lv {levelFromXp(e.xp ?? 0)}
            </span>
            <span className="w-20 text-right font-display text-xl sm:w-24 sm:text-2xl font-bold tabular-nums text-text">
              {e.wpm}
              <span className="ml-1 text-xs font-medium text-sub">wpm</span>
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const [mode, setMode] = useState<TestMode>("time");
  const [size, setSize] = useState(30);
  const sizeOptions = mode === "time" ? TIME_OPTIONS : WORD_OPTIONS;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="mx-auto flex w-full max-w-4xl flex-col gap-10 py-12 sm:py-16"
    >
      <motion.div variants={fadeUp}>
        <PageHeader title="Leaderboard" description="The fastest typists, by mode and length." />
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <div className="surface !rounded-full flex gap-1 p-1">
          {(["time", "words"] as TestMode[]).map((m) => (
            <Pill
              key={m}
              active={mode === m}
              onClick={() => {
                setMode(m);
                setSize(m === "time" ? 30 : 25);
              }}
            >
              {m}
            </Pill>
          ))}
        </div>
        <div className="surface !rounded-full flex gap-1 p-1">
          {sizeOptions.map((s) => (
            <Pill key={s} active={size === s} onClick={() => setSize(s)}>
              {s}
            </Pill>
          ))}
        </div>
      </motion.div>

      <LeaderboardTable key={`${mode}-${size}`} mode={mode} size={size} />
    </motion.div>
  );
}
