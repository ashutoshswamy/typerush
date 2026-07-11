import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  increment,
  onSnapshot,
  setDoc,
  deleteDoc,
  type Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CharStats } from "./wpm";
import { xpForResult } from "./xp";

export type TestMode = "time" | "words" | "quote" | "zen";

export interface TestConfig {
  duration?: number;
  wordCount?: number;
  punctuation: boolean;
  numbers: boolean;
  language: string;
}

export interface TestResultInput {
  mode: TestMode;
  config: TestConfig;
  wpm: number;
  wpmNet: number;
  accuracy: number;
  consistency: number;
  charStats: CharStats;
  wpmTimeline: number[];
  elapsedSeconds: number;
}

export interface TestResult extends TestResultInput {
  id: string;
  createdAt: Timestamp;
}

export function configKey(mode: TestMode, config: TestConfig): string {
  const size = mode === "time" ? config.duration : config.wordCount;
  return `${mode}-${size ?? "na"}`;
}

// Local calendar day, not UTC — a streak should track the user's own day
// boundary, not the server's.
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterday(d: Date): Date {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return y;
}

// Guests never reach here — caller checks auth state first.
export async function saveTestResult(
  uid: string,
  username: string,
  input: TestResultInput,
  photoURL: string | null = null
): Promise<{ isNewBest: boolean; xpGained: number }> {
  if (!db) throw new Error("Firestore not configured");

  const key = configKey(input.mode, input.config);
  const resultRef = doc(collection(db, "users", uid, "testResults"));
  const bestRef = doc(db, "users", uid, "personalBests", key);
  const leaderboardRef = doc(db, "leaderboard", key, "entries", uid);
  const userRef = doc(db, "users", uid);

  const [bestSnap, userSnap] = await Promise.all([getDoc(bestRef), getDoc(userRef)]);
  const currentBest = bestSnap.exists() ? (bestSnap.data().bestWpm as number) : 0;
  const isNewBest = input.wpmNet > currentBest;
  const xpGained = xpForResult(input.wpmNet, input.accuracy);

  const userData = userSnap.exists() ? (userSnap.data() as Partial<UserProfile>) : {};
  const now = new Date();
  const today = dayKey(now);
  const lastTestDate = userData.lastTestDate;
  const currentStreak =
    lastTestDate === today
      ? userData.currentStreak ?? 1
      : lastTestDate === dayKey(yesterday(now))
        ? (userData.currentStreak ?? 0) + 1
        : 1;
  const longestStreak = Math.max(userData.longestStreak ?? 0, currentStreak);

  const batch = writeBatch(db);
  batch.set(resultRef, { ...input, createdAt: serverTimestamp() });
  batch.update(userRef, {
    xp: increment(xpGained),
    testsCompleted: increment(1),
    totalTimeSeconds: increment(input.elapsedSeconds),
    lastTestDate: today,
    currentStreak,
    longestStreak,
  });

  if (isNewBest) {
    batch.set(bestRef, {
      bestWpm: input.wpmNet,
      resultId: resultRef.id,
      achievedAt: serverTimestamp(),
    });
    batch.set(leaderboardRef, {
      username,
      photoURL,
      wpm: input.wpmNet,
      achievedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return { isNewBest, xpGained };
}

export async function getRecentResults(uid: string, count = 20): Promise<TestResult[]> {
  if (!db) return [];
  const q = query(
    collection(db, "users", uid, "testResults"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as TestResultInput & { createdAt: Timestamp }) }));
}

export interface PersonalBest {
  configKey: string;
  bestWpm: number;
  resultId: string;
  achievedAt: Timestamp;
}

export async function getPersonalBests(uid: string): Promise<PersonalBest[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, "users", uid, "personalBests"));
  return snap.docs.map((d) => ({ configKey: d.id, ...(d.data() as Omit<PersonalBest, "configKey">) }));
}

export interface UserProfile {
  uid: string;
  username: string;
  photoURL: string | null;
  createdAt: Timestamp;
  themePref: string;
  xp?: number;
  usernameSet?: boolean;
  testsCompleted?: number;
  totalTimeSeconds?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastTestDate?: string;
}

// OAuth sign-in auto-fills username from the provider's display name, so we
// track whether the user has actually chosen one — UsernamePrompt gates on
// this until they do.
// Letters/digits/underscore only — keeps profile URLs (/profile/{username})
// clean for canonical links and sitemaps, and matches the same pattern
// enforced server-side in firestore.rules.
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export async function setUsername(uid: string, username: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error("Username must be 3-20 characters: letters, numbers, and underscores only");
  }
  const existing = await getUserByUsername(username);
  if (existing && existing.uid !== uid) throw new Error("That username is already taken");
  await setDoc(doc(db, "users", uid), { username, usernameSet: true }, { merge: true });
}

// Provider display names / email prefixes are unrestricted — strip anything
// outside the allowed charset before ever writing a seed username.
export function sanitizeUsername(raw: string): string {
  const stripped = raw.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
  return stripped.length >= 3 ? stripped : `racer${Math.floor(Math.random() * 100000)}`;
}

export function listenUserProfile(uid: string, cb: (profile: UserProfile | null) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(doc(db, "users", uid), (snap) => {
    cb(snap.exists() ? ({ uid, ...(snap.data() as Omit<UserProfile, "uid">) }) : null);
  });
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  if (!db) return null;
  const q = query(collection(db, "users"), where("username", "==", username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) };
}

export interface LeaderboardEntry {
  uid: string;
  username: string;
  photoURL: string | null;
  wpm: number;
  xp: number;
  achievedAt: Timestamp;
}

// Leaderboard entries are a WPM snapshot, written only when a user beats
// their PB — username/photoURL/xp on that doc go stale the moment the
// account changes. Refresh all three live from users/{uid} so the
// leaderboard always shows the current pfp and level, not a PB-day snapshot.
export async function getLeaderboard(key: string, count = 50): Promise<LeaderboardEntry[]> {
  if (!db) return [];
  const database = db;
  const q = query(
    collection(database, "leaderboard", key, "entries"),
    orderBy("wpm", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  const entries = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<LeaderboardEntry, "uid">) }));

  const profiles = await Promise.all(
    entries.map((e) => getDoc(doc(database, "users", e.uid)))
  );

  return entries.map((e, i) => {
    const profile = profiles[i];
    if (!profile.exists()) return e;
    const data = profile.data() as { username?: string; photoURL?: string | null; xp?: number };
    return { ...e, username: data.username ?? e.username, photoURL: data.photoURL ?? null, xp: data.xp ?? 0 };
  });
}

export interface UserDataExport {
  profile: Record<string, unknown> | null;
  testResults: (TestResultInput & { id: string })[];
  personalBests: (Omit<PersonalBest, "configKey"> & { configKey: string })[];
  exportedAt: string;
}

// Everything Firestore holds under this uid, as one downloadable snapshot.
export async function exportUserData(uid: string): Promise<UserDataExport> {
  if (!db) throw new Error("Firestore not configured");
  const [profileSnap, resultsSnap, bestsSnap] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDocs(collection(db, "users", uid, "testResults")),
    getDocs(collection(db, "users", uid, "personalBests")),
  ]);
  return {
    profile: profileSnap.exists() ? profileSnap.data() : null,
    testResults: resultsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as TestResultInput) })),
    personalBests: bestsSnap.docs.map((d) => ({
      configKey: d.id,
      ...(d.data() as Omit<PersonalBest, "configKey">),
    })),
    exportedAt: new Date().toISOString(),
  };
}

// Wipes test history, personal bests, race history, leaderboard entries,
// and resets xp/level back to zero — keeps the account itself and the
// friends list intact (that's a social graph, not test data).
export async function deleteAllTestData(uid: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  const database = db;

  const [resultsSnap, bestsSnap, raceHistorySnap] = await Promise.all([
    getDocs(collection(database, "users", uid, "testResults")),
    getDocs(collection(database, "users", uid, "personalBests")),
    getDocs(collection(database, "users", uid, "raceHistory")),
  ]);

  const refs = [
    ...resultsSnap.docs.map((d) => d.ref),
    ...bestsSnap.docs.map((d) => d.ref),
    ...bestsSnap.docs.map((d) => doc(database, "leaderboard", d.id, "entries", uid)),
    ...raceHistorySnap.docs.map((d) => d.ref),
  ];

  // Firestore batches cap at 500 writes.
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(database);
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  await setDoc(
    doc(database, "users", uid),
    { xp: 0, testsCompleted: 0, totalTimeSeconds: 0, currentStreak: 0, longestStreak: 0, lastTestDate: null },
    { merge: true }
  );
}

// Purges every Firestore doc owned by this uid: test history, personal
// bests, this user's leaderboard entries (one per personal-best config),
// and the user profile doc itself. Caller deletes the Auth account after.
export async function deleteUserData(uid: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  const database = db;

  const [resultsSnap, bestsSnap, raceHistorySnap] = await Promise.all([
    getDocs(collection(database, "users", uid, "testResults")),
    getDocs(collection(database, "users", uid, "personalBests")),
    getDocs(collection(database, "users", uid, "raceHistory")),
  ]);

  const refs = [
    ...resultsSnap.docs.map((d) => d.ref),
    ...bestsSnap.docs.map((d) => d.ref),
    ...bestsSnap.docs.map((d) => doc(database, "leaderboard", d.id, "entries", uid)),
    ...raceHistorySnap.docs.map((d) => d.ref),
    doc(database, "users", uid),
  ];

  // Firestore batches cap at 500 writes.
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(database);
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

// ---------------------------------------------------------------------------
// Friends
// ---------------------------------------------------------------------------

export interface FriendEntry {
  uid: string;
  username: string;
  photoURL: string | null;
  since: Timestamp;
}

export interface FriendRequest {
  fromUid: string;
  fromUsername: string;
  fromPhotoURL: string | null;
  createdAt: Timestamp;
}

// Prefix match on username (Firestore has no full-text search) — good enough
// for a handle-style username field with no spaces.
export async function searchUsers(queryStr: string, excludeUid: string, count = 10): Promise<UserProfile[]> {
  if (!db || !queryStr.trim()) return [];
  const q = query(
    collection(db, "users"),
    orderBy("username"),
    where("username", ">=", queryStr),
    where("username", "<=", queryStr + ""),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }))
    .filter((u) => u.uid !== excludeUid);
}

export async function sendFriendRequest(
  fromUid: string,
  fromUsername: string,
  fromPhotoURL: string | null,
  toUid: string
): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  await setDoc(doc(db, "users", toUid, "friendRequests", fromUid), {
    fromUid,
    fromUsername,
    fromPhotoURL,
    createdAt: serverTimestamp(),
  });
}

export function listenIncomingRequests(uid: string, cb: (requests: FriendRequest[]) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(collection(db, "users", uid, "friendRequests"), (snap) => {
    cb(snap.docs.map((d) => d.data() as FriendRequest));
  });
}

export async function cancelFriendRequest(toUid: string, fromUid: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  await deleteDoc(doc(db, "users", toUid, "friendRequests", fromUid));
}

export const declineFriendRequest = cancelFriendRequest;

// Both sides record the other as a friend, and the request is consumed —
// each user only ever writes the entry that represents themselves (see
// firestore.rules), so this is two self-writes, not a cross-account write.
export async function acceptFriendRequest(
  uid: string,
  username: string,
  photoURL: string | null,
  request: FriendRequest
): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  const batch = writeBatch(db);
  batch.set(doc(db, "users", uid, "friends", request.fromUid), {
    uid: request.fromUid,
    username: request.fromUsername,
    photoURL: request.fromPhotoURL,
    since: serverTimestamp(),
  });
  batch.set(doc(db, "users", request.fromUid, "friends", uid), {
    uid,
    username,
    photoURL,
    since: serverTimestamp(),
  });
  batch.delete(doc(db, "users", uid, "friendRequests", request.fromUid));
  await batch.commit();
}

export function listenFriends(uid: string, cb: (friends: FriendEntry[]) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(collection(db, "users", uid, "friends"), (snap) => {
    cb(snap.docs.map((d) => d.data() as FriendEntry));
  });
}

export async function removeFriend(uid: string, friendUid: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", uid, "friends", friendUid));
  batch.delete(doc(db, "users", friendUid, "friends", uid));
  await batch.commit();
}

// ---------------------------------------------------------------------------
// Races — 1v1 invite + realtime lobby
// ---------------------------------------------------------------------------

export interface RaceInvite {
  raceId: string;
  fromUid: string;
  fromUsername: string;
  fromPhotoURL: string | null;
  mode: TestMode;
  config: TestConfig;
  createdAt: Timestamp;
}

export type RaceStatus = "pending" | "active" | "finished" | "expired";

export interface RaceDoc {
  hostUid: string;
  hostUsername: string;
  hostPhotoURL: string | null;
  guestUid: string | null;
  guestUsername: string | null;
  guestPhotoURL: string | null;
  invitedUid: string;
  mode: TestMode;
  config: TestConfig;
  words: string[];
  status: RaceStatus;
  startedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface Racer {
  uid: string;
  username: string;
  photoURL: string | null;
  progress: number; // chars typed so far
  wpm: number;
  accuracy: number | null; // set on finish
  consistency: number | null; // set on finish
  wpmTimeline: number[]; // set on finish
  finished: boolean;
}

// Host creates the lobby (fixed word list both racers type against) and
// drops an invite in the friend's inbox in the same batch.
export async function createRaceInvite(
  hostUid: string,
  hostUsername: string,
  hostPhotoURL: string | null,
  friendUid: string,
  mode: TestMode,
  config: TestConfig,
  words: string[]
): Promise<string> {
  if (!db) throw new Error("Firestore not configured");
  const raceRef = doc(collection(db, "races"));
  const batch = writeBatch(db);
  batch.set(raceRef, {
    hostUid,
    hostUsername,
    hostPhotoURL,
    guestUid: null,
    guestUsername: null,
    guestPhotoURL: null,
    invitedUid: friendUid,
    mode,
    config,
    words,
    status: "pending",
    startedAt: null,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "users", friendUid, "raceInvites", raceRef.id), {
    raceId: raceRef.id,
    fromUid: hostUid,
    fromUsername: hostUsername,
    fromPhotoURL: hostPhotoURL,
    mode,
    config,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "races", raceRef.id, "racers", hostUid), {
    uid: hostUid,
    username: hostUsername,
    photoURL: hostPhotoURL,
    progress: 0,
    wpm: 0,
    accuracy: null,
    consistency: null,
    wpmTimeline: [],
    finished: false,
  });
  await batch.commit();
  return raceRef.id;
}

export function listenRaceInvites(uid: string, cb: (invites: RaceInvite[]) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(collection(db, "users", uid, "raceInvites"), (snap) => {
    cb(snap.docs.map((d) => d.data() as RaceInvite));
  });
}

export async function declineRaceInvite(uid: string, raceId: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  await deleteDoc(doc(db, "users", uid, "raceInvites", raceId));
}

// Guest claims the open guestUid slot, joins the racers subcollection, and
// consumes the invite — three writes the guest is uniquely allowed to make.
export async function acceptRaceInvite(
  uid: string,
  username: string,
  photoURL: string | null,
  invite: RaceInvite
): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  const batch = writeBatch(db);
  batch.update(doc(db, "races", invite.raceId), {
    guestUid: uid,
    guestUsername: username,
    guestPhotoURL: photoURL,
  });
  batch.set(doc(db, "races", invite.raceId, "racers", uid), {
    uid,
    username,
    photoURL,
    progress: 0,
    wpm: 0,
    accuracy: null,
    consistency: null,
    wpmTimeline: [],
    finished: false,
  });
  batch.delete(doc(db, "users", uid, "raceInvites", invite.raceId));
  await batch.commit();
}

export function listenRace(raceId: string, cb: (race: RaceDoc | null) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(doc(db, "races", raceId), (snap) => {
    cb(snap.exists() ? (snap.data() as RaceDoc) : null);
  });
}

export function listenRacers(raceId: string, cb: (racers: Racer[]) => void): Unsubscribe {
  if (!db) return () => {};
  return onSnapshot(collection(db, "races", raceId, "racers"), (snap) => {
    cb(snap.docs.map((d) => d.data() as Racer));
  });
}

// Both racers present and lobby still pending — flip it live. Whichever
// client observes this first wins the write; the other's identical write
// is a harmless no-op.
export async function startRace(raceId: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  await setDoc(doc(db, "races", raceId), { status: "active", startedAt: serverTimestamp() }, { merge: true });
}

export async function updateRacerProgress(
  raceId: string,
  uid: string,
  progress: number,
  wpm: number
): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "races", raceId, "racers", uid), { progress, wpm }, { merge: true });
}

export async function finishRacer(
  raceId: string,
  uid: string,
  wpm: number,
  accuracy: number,
  consistency: number,
  wpmTimeline: number[]
): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, "races", raceId, "racers", uid),
    { wpm, accuracy, consistency, wpmTimeline, finished: true },
    { merge: true }
  );
}

// No Cloud Functions in this project — expiry is enforced client-side, by
// whichever client (host waiting room or the recipient's invite countdown)
// notices 30s have passed first. Best-effort: if neither client is open
// when the window lapses, the invite/race just sits pending until someone
// looks again.
export async function expireRace(raceId: string): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, "races", raceId), { status: "expired" }, { merge: true });
}

// ---------------------------------------------------------------------------
// Race history — one denormalized doc per participant per finished race
// ---------------------------------------------------------------------------

export interface RaceHistoryEntry {
  raceId: string;
  mode: TestMode;
  config: TestConfig;
  won: boolean;
  self: { wpm: number; accuracy: number; consistency: number; wpmTimeline: number[] };
  opponent: { uid: string; username: string; photoURL: string | null; wpm: number; accuracy: number; consistency: number };
  createdAt: Timestamp;
}

export async function saveRaceHistory(
  uid: string,
  entry: Omit<RaceHistoryEntry, "createdAt">
): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  await setDoc(doc(db, "users", uid, "raceHistory", entry.raceId), {
    ...entry,
    createdAt: serverTimestamp(),
  });
}

export async function getRaceHistory(uid: string, count = 10): Promise<RaceHistoryEntry[]> {
  if (!db) return [];
  const q = query(collection(db, "users", uid, "raceHistory"), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RaceHistoryEntry);
}
