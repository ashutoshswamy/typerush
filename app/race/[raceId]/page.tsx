"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Swords, Crown, Clock } from "lucide-react";
import { useEngine } from "@/store/engine";
import { useAuth } from "@/components/AuthProvider";
import { Panel } from "@/components/Panel";
import { Avatar } from "@/components/Avatar";
import { TestArea } from "@/components/TestArea";
import { Results } from "@/components/Results";
import { rawWpm } from "@/lib/wpm";
import {
  listenRace,
  listenRacers,
  startRace,
  updateRacerProgress,
  finishRacer,
  expireRace,
  saveRaceHistory,
  type RaceDoc,
  type Racer,
} from "@/lib/firestore";

const PUSH_INTERVAL_MS = 400;
const INVITE_TIMEOUT_S = 30;

export default function RacePage() {
  const { raceId } = useParams<{ raceId: string }>();
  const { user, loading } = useAuth();
  const { status, results, configure } = useEngine();

  const [race, setRace] = useState<RaceDoc | null | undefined>(undefined);
  const [racers, setRacers] = useState<Racer[]>([]);

  const startedRef = useRef(false);
  const configuredRef = useRef(false);
  const [configured, setConfigured] = useState(false);
  const finishedRef = useRef(false);
  const expiredRef = useRef(false);
  const historyRef = useRef(false);
  const [waitSeconds, setWaitSeconds] = useState(INVITE_TIMEOUT_S);

  useEffect(() => listenRace(raceId, setRace), [raceId]);
  useEffect(() => listenRacers(raceId, setRacers), [raceId]);

  // Once both racers have joined, either client flips the lobby live —
  // the other's identical write is a harmless no-op.
  useEffect(() => {
    if (!race || startedRef.current) return;
    if (race.status === "pending" && race.guestUid && (user?.uid === race.hostUid || user?.uid === race.guestUid)) {
      startedRef.current = true;
      startRace(raceId).catch(() => {});
    }
  }, [race, user, raceId]);

  // No opponent yet — count down from the invite's createdAt, and expire the
  // race client-side once 30s pass with nobody home to notice server-side
  // (no Cloud Functions in this project).
  useEffect(() => {
    if (!race || race.status !== "pending" || race.guestUid || !user) return;
    const createdMs = race.createdAt?.toMillis?.() ?? Date.now();
    const tick = () => {
      const remaining = INVITE_TIMEOUT_S - Math.floor((Date.now() - createdMs) / 1000);
      setWaitSeconds(Math.max(0, remaining));
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        expireRace(raceId).catch(() => {});
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [race, user, raceId]);

  // Fixed word list both racers type against — configure the shared engine
  // once the lobby goes active, instead of the usual random buffer.
  useEffect(() => {
    if (!race || race.status !== "active" || configuredRef.current) return;
    configuredRef.current = true;
    configure(race.mode, race.config, 200, race.words);
    setConfigured(true);
  }, [race, configure]);

  // Push local progress to Firestore so the opponent's bar moves live.
  useEffect(() => {
    if (status !== "running" || !user || !race) return;
    const interval = setInterval(() => {
      const s = useEngine.getState();
      const charsTyped = s.typed.reduce((sum, w) => sum + w.length, 0) + s.wordIndex;
      const wpm = rawWpm(charsTyped, s.elapsedMs / 1000);
      updateRacerProgress(raceId, user.uid, charsTyped, wpm).catch(() => {});
    }, PUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, user, race, raceId]);

  useEffect(() => {
    if (status !== "finished" || !results || !user || finishedRef.current) return;
    finishedRef.current = true;
    finishRacer(raceId, user.uid, results.wpmNet, results.accuracy, results.consistency, results.wpmTimeline).catch(
      (err) => console.error("finish racer failed:", err)
    );
  }, [status, results, user, raceId]);

  // Once both racers have a final score, each client records its own
  // perspective — self's full result plus the opponent's final numbers.
  useEffect(() => {
    if (!race || !user || historyRef.current) return;
    const self = racers.find((r) => r.uid === user.uid);
    const opponent = racers.find((r) => r.uid !== user.uid);
    if (!self?.finished || !opponent?.finished) return;
    historyRef.current = true;
    saveRaceHistory(user.uid, {
      raceId,
      mode: race.mode,
      config: race.config,
      won: self.wpm >= opponent.wpm,
      self: { wpm: self.wpm, accuracy: self.accuracy ?? 0, consistency: self.consistency ?? 0, wpmTimeline: self.wpmTimeline ?? [] },
      opponent: {
        uid: opponent.uid,
        username: opponent.username,
        photoURL: opponent.photoURL,
        wpm: opponent.wpm,
        accuracy: opponent.accuracy ?? 0,
        consistency: opponent.consistency ?? 0,
      },
    }).catch((err) => console.error("save race history failed:", err));
  }, [race, racers, user, raceId]);

  if (loading || race === undefined) return null;
  if (!user) {
    return (
      <p className="font-test text-sub text-xs tracking-[0.15em] uppercase text-center py-24">
        sign in to join a race
      </p>
    );
  }
  if (!race || (user.uid !== race.hostUid && user.uid !== race.guestUid && user.uid !== race.invitedUid)) {
    return (
      <p className="font-test text-sub text-xs tracking-[0.15em] uppercase text-center py-24">
        no signal — race not found
      </p>
    );
  }

  const totalChars = race.words.join(" ").length;
  const self = racers.find((r) => r.uid === user.uid);
  const opponent = racers.find((r) => r.uid !== user.uid);
  const bothFinished = Boolean(self?.finished && opponent?.finished);
  const iWon = bothFinished && self && opponent && self.wpm >= opponent.wpm;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-10">
      <Panel className="px-6 py-4 flex flex-col gap-4">
        <div className="font-test flex items-center justify-center gap-2 text-[10px] tracking-[0.25em] uppercase text-sub">
          <Swords size={13} className="text-main" aria-hidden="true" />
          race
        </div>

        {racers.map((r) => {
          const pct = totalChars > 0 ? Math.min(100, Math.round((r.progress / totalChars) * 100)) : 0;
          const isSelf = r.uid === user.uid;
          return (
            <div key={r.uid} className="flex items-center gap-3">
              <Avatar src={r.photoURL} label={r.username} size={26} />
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className={`truncate ${isSelf ? "text-main" : "text-text"}`}>{r.username}{isSelf ? " (you)" : ""}</span>
                  <span className="text-sub tabular-nums">{r.finished ? `finished · ${r.wpm} wpm` : `${r.wpm} wpm`}</span>
                </div>
                <div className="h-1.5 w-full bg-sub-alt overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-[width] duration-300 ${r.finished ? "bg-main" : "bg-main/70"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {!opponent && race.status === "pending" && (
          <p className="font-test flex items-center justify-center gap-1.5 text-center text-sub text-xs tracking-[0.1em] uppercase py-2">
            <Clock size={12} aria-hidden="true" />
            waiting for opponent to join… invite expires in {waitSeconds}s
          </p>
        )}
      </Panel>

      {bothFinished && self && opponent && (
        <Panel className="px-6 py-5 flex flex-col gap-4">
          <div className="font-test flex items-center justify-center gap-2 text-sm uppercase tracking-[0.15em]">
            <Crown size={16} className={iWon ? "text-main" : "text-sub"} aria-hidden="true" />
            <span className={iWon ? "text-main" : "text-sub"}>{iWon ? "you won this race" : "opponent won this race"}</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-sub/15">
            {[self, opponent].map((r) => (
              <div key={r.uid} className="flex flex-col items-center gap-3 px-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar src={r.photoURL} label={r.username} size={22} />
                  <span className={`font-test text-xs truncate ${r.uid === user.uid ? "text-main" : "text-text"}`}>
                    {r.username}
                    {r.uid === user.uid ? " (you)" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full font-test text-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display text-2xl text-text tabular-nums leading-none">{r.wpm}</span>
                    <span className="text-sub text-[9px] tracking-[0.1em] uppercase">wpm</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display text-2xl text-text tabular-nums leading-none">{r.accuracy ?? "—"}</span>
                    <span className="text-sub text-[9px] tracking-[0.1em] uppercase">acc</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display text-2xl text-text tabular-nums leading-none">{r.consistency ?? "—"}</span>
                    <span className="text-sub text-[9px] tracking-[0.1em] uppercase">cons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {race.status === "active" && configured && (status !== "finished" ? <TestArea /> : <Results />)}
      {race.status === "pending" && opponent && (
        <p className="font-test text-center text-sub text-xs tracking-[0.15em] uppercase py-10">
          waiting for race to start…
        </p>
      )}
      {race.status === "expired" && (
        <p className="font-test text-center text-sub text-xs tracking-[0.15em] uppercase py-10">
          invite expired — nobody joined in time
        </p>
      )}
    </motion.div>
  );
}
