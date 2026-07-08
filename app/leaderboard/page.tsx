"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getLeaderboard, configKey, type LeaderboardEntry, type TestMode } from "@/lib/firestore";
import { Panel } from "@/components/Panel";
import { SignalBar } from "@/components/SignalBar";

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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3 items-end">
        {podiumOrder.map((e, slot) => {
          if (!e) return <div key={slot} />;
          const rank = entries.indexOf(e) + 1;
          const isFirst = rank === 1;
          return (
            <Panel
              key={e.uid}
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
            </Panel>
          );
        })}
      </div>

      {rest.length > 0 && (
        <Panel className="font-test flex flex-col text-sm">
          {rest.map((e, i) => (
            <div
              key={e.uid}
              className="flex items-center gap-4 px-4 py-3 border-b border-sub/15 last:border-b-0 text-text"
            >
              <span className="flex items-center justify-center w-8 text-xs tabular-nums text-sub">
                {String(i + 4).padStart(2, "0")}
              </span>
              <Link href={`/profile/${e.username}`} className="flex-1 hover:text-main transition-colors">
                {e.username}
              </Link>
              <div className="w-24 hidden sm:block">
                <SignalBar value={e.wpm} max={max} />
              </div>
              <span className="tabular-nums w-20 text-right">{e.wpm} wpm</span>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const [mode, setMode] = useState<TestMode>("time");
  const [size, setSize] = useState(30);
  const sizeOptions = mode === "time" ? TIME_OPTIONS : WORD_OPTIONS;

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto py-14 w-full">
      <div>
        <p className="font-test text-[10px] tracking-[0.3em] uppercase text-sub mb-1">top signal readings</p>
        <h1 className="font-display text-3xl text-text tracking-tight">Leaderboard</h1>
      </div>

      <Panel className="flex flex-wrap gap-5 text-xs tracking-[0.15em] uppercase text-sub px-5 py-3 w-fit self-start">
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

      <LeaderboardTable key={`${mode}-${size}`} mode={mode} size={size} />
    </div>
  );
}
