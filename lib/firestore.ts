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
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CharStats } from "./wpm";

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
}

export interface TestResult extends TestResultInput {
  id: string;
  createdAt: Timestamp;
}

export function configKey(mode: TestMode, config: TestConfig): string {
  const size = mode === "time" ? config.duration : config.wordCount;
  return `${mode}-${size ?? "na"}`;
}

// Guests never reach here — caller checks auth state first.
export async function saveTestResult(
  uid: string,
  username: string,
  input: TestResultInput
): Promise<{ isNewBest: boolean }> {
  if (!db) throw new Error("Firestore not configured");

  const key = configKey(input.mode, input.config);
  const resultRef = doc(collection(db, "users", uid, "testResults"));
  const bestRef = doc(db, "users", uid, "personalBests", key);
  const leaderboardRef = doc(db, "leaderboard", key, "entries", uid);

  const bestSnap = await getDoc(bestRef);
  const currentBest = bestSnap.exists() ? (bestSnap.data().bestWpm as number) : 0;
  const isNewBest = input.wpmNet > currentBest;

  const batch = writeBatch(db);
  batch.set(resultRef, { ...input, createdAt: serverTimestamp() });

  if (isNewBest) {
    batch.set(bestRef, {
      bestWpm: input.wpmNet,
      resultId: resultRef.id,
      achievedAt: serverTimestamp(),
    });
    batch.set(leaderboardRef, {
      username,
      wpm: input.wpmNet,
      achievedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return { isNewBest };
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
  wpm: number;
  achievedAt: Timestamp;
}

export async function getLeaderboard(key: string, count = 50): Promise<LeaderboardEntry[]> {
  if (!db) return [];
  const q = query(
    collection(db, "leaderboard", key, "entries"),
    orderBy("wpm", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<LeaderboardEntry, "uid">) }));
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

// Purges every Firestore doc owned by this uid: test history, personal
// bests, this user's leaderboard entries (one per personal-best config),
// and the user profile doc itself. Caller deletes the Auth account after.
export async function deleteUserData(uid: string): Promise<void> {
  if (!db) throw new Error("Firestore not configured");
  const database = db;

  const [resultsSnap, bestsSnap] = await Promise.all([
    getDocs(collection(database, "users", uid, "testResults")),
    getDocs(collection(database, "users", uid, "personalBests")),
  ]);

  const refs = [
    ...resultsSnap.docs.map((d) => d.ref),
    ...bestsSnap.docs.map((d) => d.ref),
    ...bestsSnap.docs.map((d) => doc(database, "leaderboard", d.id, "entries", uid)),
    doc(database, "users", uid),
  ];

  // Firestore batches cap at 500 writes.
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(database);
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
