"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getUserByUsername,
  getPersonalBests,
  getRecentResults,
  type UserProfile,
  type PersonalBest,
  type TestResult,
} from "@/lib/firestore";
import { Panel } from "@/components/Panel";
import { SignalBar } from "@/components/SignalBar";
import { SectionLabel } from "@/components/SectionLabel";
import { Avatar } from "@/components/Avatar";

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [bests, setBests] = useState<PersonalBest[]>([]);
  const [recent, setRecent] = useState<TestResult[]>([]);

  useEffect(() => {
    setProfile(undefined);
    getUserByUsername(username).then((p) => {
      setProfile(p);
      if (p) {
        getPersonalBests(p.uid).then(setBests);
        getRecentResults(p.uid, 10).then(setRecent);
      }
    });
  }, [username]);

  if (profile === undefined)
    return (
      <p className="text-sub text-xs tracking-[0.15em] uppercase text-center py-14">
        reading signal…
      </p>
    );
  if (profile === null)
    return (
      <p className="text-sub text-xs tracking-[0.15em] uppercase text-center py-14">
        no signal — user not found
      </p>
    );

  const maxBest = Math.max(...bests.map((b) => b.bestWpm), 1);
  const maxRecent = Math.max(...recent.map((r) => r.wpmNet), 1);
  const topBest = bests.length > 0 ? Math.max(...bests.map((b) => b.bestWpm)) : null;
  const memberSince = profile.createdAt ? formatDate(profile.createdAt.toDate()) : null;

  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto py-14 w-full">
      <div className="flex items-center gap-4">
        <Avatar src={profile.photoURL} label={profile.username} size={56} />
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="font-display text-4xl text-main tracking-tight truncate">{profile.username}</h1>
          {memberSince && (
            <span className="text-sub text-xs tracking-[0.08em] uppercase">racing since {memberSince}</span>
          )}
        </div>
        {topBest !== null && (
          <div className="ml-auto text-right shrink-0">
            <div className="font-display text-3xl text-main tabular-nums leading-none">{topBest}</div>
            <div className="text-sub text-xs tracking-[0.1em] uppercase mt-1">peak wpm</div>
          </div>
        )}
      </div>

      <div>
        <SectionLabel>personal bests</SectionLabel>
        {bests.length === 0 && (
          <p className="font-test text-sub text-xs tracking-[0.1em] uppercase py-2">no results yet</p>
        )}
        <div className="font-test grid grid-cols-2 gap-3">
          {bests.map((b) => (
            <Panel key={b.configKey} className="flex flex-col gap-2 px-4 py-3">
              <span className="text-sub uppercase text-xs tracking-[0.1em]">{b.configKey}</span>
              <span className="text-main text-2xl tabular-nums font-medium">{b.bestWpm}<span className="text-xs text-sub ml-1">wpm</span></span>
              <SignalBar value={b.bestWpm} max={maxBest} />
            </Panel>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>recent tests</SectionLabel>
        <Panel className="font-test flex flex-col text-sm">
          {recent.length === 0 && (
            <p className="text-sub text-xs tracking-[0.1em] uppercase py-4 px-4">no tests yet</p>
          )}
          {recent.map((r) => (
            <div key={r.id} className="flex items-center gap-4 text-text border-b border-sub/15 last:border-b-0 px-4 py-2.5">
              <span className="text-main w-14 text-right tabular-nums">{r.wpmNet}</span>
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sub uppercase tracking-[0.08em]">
                    {r.mode} {r.config.duration ?? r.config.wordCount}
                  </span>
                  <span className="text-sub/70 tabular-nums">{r.accuracy}% acc</span>
                </div>
                <SignalBar value={r.wpmNet} max={maxRecent} />
              </div>
              <span className="text-sub/60 text-xs w-20 text-right shrink-0 tabular-nums">
                {formatDate(r.createdAt.toDate())}
              </span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
