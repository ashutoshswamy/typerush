"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Crown, Swords, ListChecks, Timer, Flame, Trophy } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import {
  getUserByUsername,
  getPersonalBests,
  getRecentResults,
  getRaceHistory,
  configKey,
  type UserProfile,
  type PersonalBest,
  type TestResult,
  type RaceHistoryEntry,
} from "@/lib/firestore";
import { Panel } from "@/components/Panel";
import { SignalBar } from "@/components/SignalBar";
import { SectionLabel } from "@/components/SectionLabel";
import { Avatar } from "@/components/Avatar";
import { Oscilloscope } from "@/components/Oscilloscope";
import { Gauge } from "@/components/Gauge";
import { LevelBadge } from "@/components/LevelBadge";

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

// "time-15" -> ["TIME", "15"], "quote-na" -> ["QUOTE", null]
function splitConfigKey(key: string): [string, string | null] {
  const [mode, size] = key.split("-");
  return [mode.toUpperCase(), size === "na" ? null : size];
}

function niceMax(peak: number): number {
  return Math.max(50, Math.ceil((peak * 1.25) / 25) * 25);
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${Math.round(totalSeconds)}s`;
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [loadedUsername, setLoadedUsername] = useState<string | null>(null);
  const [bests, setBests] = useState<PersonalBest[]>([]);
  const [recent, setRecent] = useState<TestResult[]>([]);
  const [races, setRaces] = useState<RaceHistoryEntry[]>([]);

  useEffect(() => {
    getUserByUsername(username).then((p) => {
      setProfile(p);
      setLoadedUsername(username);
      if (p) {
        getPersonalBests(p.uid).then(setBests);
        getRecentResults(p.uid, 10).then(setRecent);
        getRaceHistory(p.uid, 10).then(setRaces);
      }
    });
  }, [username]);

  if (loadedUsername !== username)
    return (
      <p className="font-test text-sub text-xs tracking-[0.15em] uppercase text-center py-14">
        reading signal…
      </p>
    );
  if (!profile)
    return (
      <p className="font-test text-sub text-xs tracking-[0.15em] uppercase text-center py-14">
        no signal — user not found
      </p>
    );

  const maxBest = Math.max(...bests.map((b) => b.bestWpm), 1);
  const peak = bests.length > 0 ? Math.max(...bests.map((b) => b.bestWpm)) : 0;
  const gaugeMax = niceMax(peak);
  const avgAcc = recent.length > 0 ? Math.round(recent.reduce((s, r) => s + r.accuracy, 0) / recent.length) : null;
  const memberSince = profile.createdAt ? formatDate(profile.createdAt.toDate()) : null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="flex flex-col gap-10 max-w-3xl mx-auto py-14 w-full"
    >
      {/* Spec plate — identity read as an instrument's ID stamp, peak wpm
          read off a needle sweep instead of a flat digit. */}
      <motion.div variants={fadeUp}>
        <Panel className="flex flex-wrap items-center gap-6 sm:gap-10 px-6 py-6">
          <Avatar src={profile.photoURL} label={profile.username} size={64} />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <h1 className="font-display text-4xl sm:text-5xl text-main tracking-tight truncate leading-none">
              {profile.username}
            </h1>
            <div className="font-test flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] tracking-[0.15em] uppercase text-sub">
              {memberSince && <span>racing since {memberSince}</span>}
              <span>{bests.length} channel{bests.length === 1 ? "" : "s"} calibrated</span>
              {avgAcc !== null && <span>{avgAcc}% recent accuracy</span>}
            </div>
          </div>
          <LevelBadge xp={profile.xp ?? 0} />
          <Gauge value={peak} max={gaugeMax} />
        </Panel>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Panel className="font-test flex flex-col gap-1.5 px-4 py-3.5">
          <span className="flex items-center gap-1.5 text-sub text-[10px] tracking-[0.15em] uppercase">
            <ListChecks size={12} aria-hidden="true" />
            tests taken
          </span>
          <span className="font-display text-2xl text-text tabular-nums leading-none">
            {profile.testsCompleted ?? 0}
          </span>
        </Panel>
        <Panel className="font-test flex flex-col gap-1.5 px-4 py-3.5">
          <span className="flex items-center gap-1.5 text-sub text-[10px] tracking-[0.15em] uppercase">
            <Timer size={12} aria-hidden="true" />
            time typed
          </span>
          <span className="font-display text-2xl text-text tabular-nums leading-none">
            {formatDuration(profile.totalTimeSeconds ?? 0)}
          </span>
        </Panel>
        <Panel className="font-test flex flex-col gap-1.5 px-4 py-3.5">
          <span className="flex items-center gap-1.5 text-sub text-[10px] tracking-[0.15em] uppercase">
            <Flame size={12} aria-hidden="true" className={profile.currentStreak ? "text-main" : ""} />
            current streak
          </span>
          <span className="font-display text-2xl text-text tabular-nums leading-none">
            {profile.currentStreak ?? 0}
            <span className="text-xs text-sub ml-1.5 font-test">day{profile.currentStreak === 1 ? "" : "s"}</span>
          </span>
        </Panel>
        <Panel className="font-test flex flex-col gap-1.5 px-4 py-3.5">
          <span className="flex items-center gap-1.5 text-sub text-[10px] tracking-[0.15em] uppercase">
            <Trophy size={12} aria-hidden="true" />
            longest streak
          </span>
          <span className="font-display text-2xl text-text tabular-nums leading-none">
            {profile.longestStreak ?? 0}
            <span className="text-xs text-sub ml-1.5 font-test">day{profile.longestStreak === 1 ? "" : "s"}</span>
          </span>
        </Panel>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SectionLabel>personal bests</SectionLabel>
        {bests.length === 0 && (
          <Panel className="font-test flex items-center justify-center text-sub text-xs tracking-[0.1em] uppercase py-6 px-4">
            channel idle — no results logged yet
          </Panel>
        )}
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {bests.map((b, i) => {
            const [mode, size] = splitConfigKey(b.configKey);
            return (
              <motion.div key={b.configKey} variants={fadeUp}>
                <Panel className="font-test flex flex-col gap-3 px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-main text-[10px] tracking-[0.15em]">CH{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sub text-[10px] tracking-[0.1em] truncate">
                      {mode}
                      {size && <> · {size}</>}
                    </span>
                  </div>
                  <span className="font-display text-3xl text-text tabular-nums leading-none">
                    {b.bestWpm}
                    <span className="text-xs text-sub ml-1.5 font-test">wpm</span>
                  </span>
                  <SignalBar value={b.bestWpm} max={maxBest} graduated />
                </Panel>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SectionLabel>recent tests</SectionLabel>
        <Panel className="font-test flex flex-col text-sm">
          {recent.length === 0 && (
            <p className="text-sub text-xs tracking-[0.1em] uppercase py-6 px-4 text-center">log empty — take a test to populate</p>
          )}
          <motion.div initial="hidden" animate="show" variants={staggerContainer}>
            {recent.map((r) => {
              const key = configKey(r.mode, r.config);
              const best = bests.find((b) => b.configKey === key);
              const delta = best ? r.wpmNet - best.bestWpm : 0;
              return (
                <motion.div
                  key={r.id}
                  variants={fadeUp}
                  className="flex items-center gap-4 text-text border-b border-sub/15 last:border-b-0 px-4 py-3"
                >
                  <span className="text-main w-12 text-right tabular-nums text-base font-display">{r.wpmNet}</span>

                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sub uppercase tracking-[0.08em]">
                        {r.mode} {r.config.duration ?? r.config.wordCount}
                      </span>
                      <span className="text-sub/70 tabular-nums">{r.accuracy}% acc</span>
                    </div>
                    <Oscilloscope samples={r.wpmTimeline ?? []} height={26} strokeWidth={1.25} />
                  </div>

                  <span
                    className={`flex items-center gap-1 w-16 justify-end text-xs tabular-nums shrink-0 ${
                      delta > 0 ? "text-main" : delta < 0 ? "text-sub/70" : "text-sub/50"
                    }`}
                    title={best ? "vs personal best" : "no best on record yet"}
                  >
                    {delta > 0 ? (
                      <TrendingUp size={12} aria-hidden="true" />
                    ) : delta < 0 ? (
                      <TrendingDown size={12} aria-hidden="true" />
                    ) : (
                      <Minus size={12} aria-hidden="true" />
                    )}
                    {best ? `${delta > 0 ? "+" : ""}${delta}` : "—"}
                  </span>

                  <span className="text-sub/60 text-xs w-16 text-right shrink-0 tabular-nums">
                    {formatDate(r.createdAt.toDate())}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </Panel>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SectionLabel>race history</SectionLabel>
        <Panel className="font-test flex flex-col text-sm">
          {races.length === 0 && (
            <p className="text-sub text-xs tracking-[0.1em] uppercase py-6 px-4 text-center">no races run yet</p>
          )}
          <motion.div initial="hidden" animate="show" variants={staggerContainer}>
            {races.map((r) => (
              <motion.div
                key={r.raceId}
                variants={fadeUp}
                className="flex items-center gap-4 text-text border-b border-sub/15 last:border-b-0 px-4 py-3"
              >
                <Crown size={16} className={r.won ? "text-main shrink-0" : "text-sub/40 shrink-0"} aria-hidden="true" />

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sub uppercase tracking-[0.08em] flex items-center gap-1">
                      <Swords size={11} aria-hidden="true" />
                      vs {r.opponent.username}
                    </span>
                    <span className="text-sub/70 tabular-nums">
                      {r.self.wpm} wpm · {r.self.accuracy}% acc
                    </span>
                  </div>
                  <Oscilloscope samples={r.self.wpmTimeline ?? []} height={26} strokeWidth={1.25} />
                </div>

                <Avatar src={r.opponent.photoURL} label={r.opponent.username} size={26} />
                <span className="text-sub/60 text-xs w-14 text-right shrink-0 tabular-nums">
                  {r.opponent.wpm} wpm
                </span>

                <span
                  className={`text-xs w-12 text-right shrink-0 uppercase tracking-[0.08em] ${
                    r.won ? "text-main" : "text-sub/50"
                  }`}
                >
                  {r.won ? "won" : "lost"}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </Panel>
      </motion.div>
    </motion.div>
  );
}
