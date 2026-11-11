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
      <p className="py-24 text-center text-sub" aria-busy="true">
        Loading profile...
      </p>
    );
  if (!profile)
    return (
      <div className="py-24 text-center">
        <p className="font-display text-3xl font-bold text-text">User not found</p>
        <p className="mt-2 text-sub">Check the username and try again.</p>
      </div>
    );

  const maxBest = Math.max(...bests.map((b) => b.bestWpm), 1);
  const peak = bests.length > 0 ? Math.max(...bests.map((b) => b.bestWpm)) : 0;
  const gaugeMax = niceMax(peak);
  const avgAcc = recent.length > 0 ? Math.round(recent.reduce((s, r) => s + r.accuracy, 0) / recent.length) : null;
  const memberSince = profile.createdAt ? formatDate(profile.createdAt.toDate()) : null;

  const stats = [
    { icon: ListChecks, label: "Tests taken", value: String(profile.testsCompleted ?? 0) },
    { icon: Timer, label: "Time typed", value: formatDuration(profile.totalTimeSeconds ?? 0) },
    { icon: Flame, label: "Current streak", value: `${profile.currentStreak ?? 0}d`, hot: Boolean(profile.currentStreak) },
    { icon: Trophy, label: "Longest streak", value: `${profile.longestStreak ?? 0}d` },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="mx-auto grid w-full max-w-6xl gap-8 py-12 sm:py-16 lg:grid-cols-[22rem_1fr] lg:items-start"
    >
      <motion.aside variants={fadeUp} className="flex flex-col gap-4 lg:sticky lg:top-8">
        <Panel className="flex flex-col items-start gap-6 p-7">
          <div className="flex items-center gap-4 min-w-0 w-full">
            <Avatar src={profile.photoURL} label={profile.username} size={72} />
            <div className="min-w-0">
              <h1 className="font-display truncate text-3xl font-extrabold leading-tight tracking-tight text-text">
                {profile.username}
              </h1>
              <p className="text-sm text-sub">
                {memberSince ? `Member since ${memberSince}` : "Member"}
                {avgAcc !== null && `, ${avgAcc}% recent accuracy`}
              </p>
            </div>
          </div>
          <LevelBadge xp={profile.xp ?? 0} />
          <div className="self-center">
            <Gauge value={peak} max={gaugeMax} />
          </div>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((st) => (
            <Panel key={st.label} className="flex flex-col gap-2 p-4">
              <span className="flex items-center gap-1.5 text-xs text-sub">
                <st.icon size={13} aria-hidden="true" className={st.hot ? "text-main" : ""} />
                {st.label}
              </span>
              <span className="font-display text-2xl font-bold leading-none tabular-nums text-text">{st.value}</span>
            </Panel>
          ))}
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-col gap-10">
      <motion.div variants={fadeUp}>
        <SectionLabel>personal bests</SectionLabel>
        {bests.length === 0 && (
          <Panel className="flex items-center justify-center px-4 py-8 text-sub">
            No results yet. Take a test to set your first best.
          </Panel>
        )}
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {bests.map((b) => {
            const [mode, size] = splitConfigKey(b.configKey);
            return (
              <motion.div key={b.configKey} variants={fadeUp}>
                <Panel className="flex flex-col gap-3 p-5">
                  <span className="text-sm font-medium capitalize text-sub">
                    {mode.toLowerCase()}
                    {size && ` ${size}`}
                  </span>
                  <span className="font-display text-3xl text-text tabular-nums leading-none">
                    {b.bestWpm}
                    <span className="text-xs text-sub ml-1.5 font-test">wpm</span>
                  </span>
                  <SignalBar value={b.bestWpm} max={maxBest} />
                </Panel>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SectionLabel>recent tests</SectionLabel>
        <Panel className="flex flex-col overflow-hidden text-sm">
          {recent.length === 0 && (
            <p className="px-4 py-8 text-center text-sub">No tests yet.</p>
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
                  className="flex items-center gap-2.5 text-text border-b border-sub/15 last:border-b-0 px-3 py-3 sm:gap-4 sm:px-4"
                >
                  <span className="text-main w-12 text-right tabular-nums text-base font-display">{r.wpmNet}</span>

                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sub">
                        {r.mode} {r.config.duration ?? r.config.wordCount}
                      </span>
                      <span className="text-sub/70 tabular-nums">{r.accuracy}% acc</span>
                    </div>
                    <Oscilloscope samples={r.wpmTimeline ?? []} height={26} strokeWidth={1.25} />
                  </div>

                  <span
                    className={`hidden sm:flex items-center gap-1 w-16 justify-end text-xs tabular-nums shrink-0 ${
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
                    {best ? `${delta > 0 ? "+" : ""}${delta}` : "-"}
                  </span>

                  <span className="hidden min-[420px]:block text-sub/60 text-xs w-16 text-right shrink-0 tabular-nums">
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
        <Panel className="flex flex-col overflow-hidden text-sm">
          {races.length === 0 && (
            <p className="px-4 py-8 text-center text-sub">No races yet. Invite a friend from your account page.</p>
          )}
          <motion.div initial="hidden" animate="show" variants={staggerContainer}>
            {races.map((r) => (
              <motion.div
                key={r.raceId}
                variants={fadeUp}
                className="flex items-center gap-2.5 text-text border-b border-sub/15 last:border-b-0 px-3 py-3 sm:gap-4 sm:px-4"
              >
                <Crown size={16} className={r.won ? "text-main shrink-0" : "text-sub/40 shrink-0"} aria-hidden="true" />

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sub flex items-center gap-1">
                      <Swords size={11} aria-hidden="true" />
                      vs {r.opponent.username}
                    </span>
                    <span className="text-sub/70 tabular-nums">
                      {r.self.wpm} wpm, {r.self.accuracy}% acc
                    </span>
                  </div>
                  <Oscilloscope samples={r.self.wpmTimeline ?? []} height={26} strokeWidth={1.25} />
                </div>

                <Avatar src={r.opponent.photoURL} label={r.opponent.username} size={26} />
                <span className="hidden min-[420px]:block text-sub/60 text-xs w-14 text-right shrink-0 tabular-nums">
                  {r.opponent.wpm} wpm
                </span>

                <span
                  className={`text-xs w-12 text-right shrink-0 ${
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
      </div>
    </motion.div>
  );
}
