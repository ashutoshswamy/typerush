"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, Check, X, Trash2, Swords, Timer, Type, Quote, Hash } from "lucide-react";
import { Avatar } from "./Avatar";
import { Panel } from "./Panel";
import { SectionLabel } from "./SectionLabel";
import { Checkbox } from "./Checkbox";
import { generateWords } from "@/lib/wordgen";
import {
  searchUsers,
  sendFriendRequest,
  cancelFriendRequest,
  listenIncomingRequests,
  acceptFriendRequest,
  listenFriends,
  removeFriend,
  createRaceInvite,
  type UserProfile,
  type FriendRequest,
  type FriendEntry,
  type TestMode,
  type TestConfig,
} from "@/lib/firestore";

const RACE_DURATIONS = [15, 30, 60, 120];
const RACE_WORD_COUNTS = [10, 25, 50, 100];
// Time-mode races still need a fixed, finite word[] both racers share —
// generous enough for a fast typist to never run out before the timer ends.
const MAX_CPS = 10;
function raceWordCount(mode: TestMode, config: TestConfig): number {
  return mode === "time" ? Math.ceil((config.duration ?? 30) * MAX_CPS * 0.2) : config.wordCount ?? 25;
}

export function FriendsPanel({ uid, username, photoURL }: { uid: string; username: string; photoURL: string | null }) {
  const router = useRouter();
  const [queryStr, setQueryStr] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [invitingUid, setInvitingUid] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null); // `${action}:${uid}` awaiting a second click to confirm
  const [raceMode, setRaceMode] = useState<TestMode>("words");
  const [raceConfig, setRaceConfig] = useState<TestConfig>({
    wordCount: 25,
    duration: 30,
    punctuation: false,
    numbers: false,
    language: "english",
  });

  useEffect(() => listenIncomingRequests(uid, setRequests), [uid]);
  useEffect(() => listenFriends(uid, setFriends), [uid]);

  useEffect(() => {
    const q = queryStr.trim();
    if (!q) return;
    const handle = setTimeout(() => {
      searchUsers(q, uid)
        .then(setResults)
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [queryStr, uid]);

  function onQueryChange(value: string) {
    setQueryStr(value);
    if (value.trim()) setSearching(true);
    else setResults([]);
  }

  const friendUids = new Set(friends.map((f) => f.uid));
  const requestUids = new Set(requests.map((r) => r.fromUid));

  // Click once to arm, click again to confirm — same two-step pattern as
  // DangerZone, so add/remove get a confirmation without a native dialog.
  function confirmAction(key: string, run: () => void) {
    if (armed !== key) {
      setArmed(key);
      return;
    }
    setArmed(null);
    run();
  }

  async function addFriend(target: UserProfile) {
    await sendFriendRequest(uid, username, photoURL, target.uid);
    setSentTo((s) => new Set(s).add(target.uid));
  }

  async function accept(request: FriendRequest) {
    await acceptFriendRequest(uid, username, photoURL, request);
  }

  async function inviteToRace(friend: FriendEntry) {
    setInvitingUid(friend.uid);
    try {
      const count = raceWordCount(raceMode, raceConfig);
      const words = generateWords(count, {
        tier: 200,
        punctuation: raceConfig.punctuation,
        numbers: raceConfig.numbers,
      });
      const raceId = await createRaceInvite(uid, username, photoURL, friend.uid, raceMode, raceConfig, words);
      router.push(`/race/${raceId}`);
    } finally {
      setInvitingUid(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionLabel>find racers</SectionLabel>
        <Panel className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 border border-sub/25 px-3 py-2">
            <Search size={14} className="text-sub shrink-0" aria-hidden="true" />
            <input
              value={queryStr}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="search by username"
              className="font-test bg-transparent outline-none text-sm text-text placeholder:text-sub w-full"
            />
          </div>
          {searching && <p className="text-xs text-sub">searching…</p>}
          {!searching && queryStr.trim() && results.length === 0 && (
            <p className="text-xs text-sub">no users found</p>
          )}
          <div className="flex flex-col gap-2">
            {results.map((r) => {
              const isFriend = friendUids.has(r.uid);
              const alreadySent = sentTo.has(r.uid) || requestUids.has(r.uid);
              return (
                <div key={r.uid} className="flex items-center gap-2.5">
                  <Avatar src={r.photoURL} label={r.username} size={28} />
                  <span className="flex-1 text-sm text-text truncate">{r.username}</span>
                  {isFriend ? (
                    <span className="text-[10px] uppercase tracking-[0.1em] text-sub">friends</span>
                  ) : (
                    <button
                      onClick={() => confirmAction(`add:${r.uid}`, () => addFriend(r))}
                      disabled={alreadySent}
                      className={`font-test flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] disabled:text-sub disabled:cursor-default transition-colors ${
                        armed === `add:${r.uid}` ? "text-main" : "text-sub hover:text-text"
                      }`}
                    >
                      <UserPlus size={12} aria-hidden="true" />
                      {alreadySent ? "requested" : armed === `add:${r.uid}` ? "confirm?" : "add"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {requests.length > 0 && (
        <div>
          <SectionLabel>friend requests</SectionLabel>
          <Panel className="p-4 flex flex-col gap-2.5">
            {requests.map((r) => (
              <div key={r.fromUid} className="flex items-center gap-2.5">
                <Avatar src={r.fromPhotoURL} label={r.fromUsername} size={28} />
                <span className="flex-1 text-sm text-text truncate">{r.fromUsername}</span>
                <button
                  onClick={() => accept(r)}
                  className="flex items-center justify-center w-6 h-6 border border-main text-main hover:bg-main hover:text-bg transition-colors"
                  aria-label="accept"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => cancelFriendRequest(uid, r.fromUid)}
                  className="flex items-center justify-center w-6 h-6 border border-sub/40 text-sub hover:text-error hover:border-error transition-colors"
                  aria-label="decline"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </Panel>
        </div>
      )}

      <div>
        <SectionLabel>friends</SectionLabel>

        <Panel className="mb-3 px-4 py-3 flex flex-wrap items-center gap-4 font-test text-[10px] tracking-[0.1em] uppercase text-sub">
          <span className="text-sub/70">race settings</span>
          {(["time", "words"] as TestMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setRaceMode(m)}
              className={`flex items-center gap-1.5 ${raceMode === m ? "text-main" : "hover:text-text"}`}
            >
              {m === "time" ? <Timer size={12} aria-hidden="true" /> : <Type size={12} aria-hidden="true" />}
              {m}
            </button>
          ))}
          <span className="w-px h-3.5 bg-sub/40" />
          {raceMode === "time" &&
            RACE_DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setRaceConfig((c) => ({ ...c, duration: d }))}
                className={raceConfig.duration === d ? "text-main" : "hover:text-text"}
              >
                {d}
              </button>
            ))}
          {raceMode === "words" &&
            RACE_WORD_COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setRaceConfig((cfg) => ({ ...cfg, wordCount: c }))}
                className={raceConfig.wordCount === c ? "text-main" : "hover:text-text"}
              >
                {c}
              </button>
            ))}
          <span className="w-px h-3.5 bg-sub/40" />
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox
              checked={raceConfig.punctuation}
              onChange={(e) => setRaceConfig((c) => ({ ...c, punctuation: e.target.checked }))}
            />
            <Quote size={12} aria-hidden="true" />
            punctuation
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox
              checked={raceConfig.numbers}
              onChange={(e) => setRaceConfig((c) => ({ ...c, numbers: e.target.checked }))}
            />
            <Hash size={12} aria-hidden="true" />
            numbers
          </label>
        </Panel>

        <Panel className="p-4 flex flex-col gap-2.5">
          {friends.length === 0 && <p className="text-xs text-sub">no friends yet — search above to add some</p>}
          {friends.map((f) => (
            <div key={f.uid} className="flex items-center gap-2.5">
              <Avatar src={f.photoURL} label={f.username} size={28} />
              <span className="flex-1 text-sm text-text truncate">{f.username}</span>
              <button
                onClick={() => inviteToRace(f)}
                disabled={invitingUid === f.uid}
                className="font-test flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-main hover:text-text disabled:text-sub transition-colors"
              >
                <Swords size={12} aria-hidden="true" />
                {invitingUid === f.uid ? "inviting…" : "race"}
              </button>
              <button
                onClick={() => confirmAction(`remove:${f.uid}`, () => removeFriend(uid, f.uid))}
                className={`flex items-center gap-1 transition-colors ${
                  armed === `remove:${f.uid}` ? "text-error" : "text-sub hover:text-error"
                }`}
                aria-label="remove friend"
              >
                {armed === `remove:${f.uid}` && (
                  <span className="font-test text-[10px] uppercase tracking-[0.1em]">confirm?</span>
                )}
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
