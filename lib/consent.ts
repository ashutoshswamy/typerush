import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

// Version of the Terms/Privacy text the user agreed to (their "last updated" date).
export const POLICY_VERSION = "2026-07-12";

export const COOKIE_KEY = "typerush-cookie-consent";
export const AUTH_CONSENT_KEY = "typerush-auth-consent";

export type CookieChoice = "all" | "essential";

interface StoredCookie {
  choice: CookieChoice;
  at: number;
  syncedUid?: string;
}
interface StoredAuth {
  at: number;
  version: string;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Private, owner-only doc (users/{uid} itself is publicly readable, so
// consent records never live there). See firestore.rules, /private/consent.
const consentRef = (uid: string) => (db ? doc(db, "users", uid, "private", "consent") : null);

export function saveCookieChoice(choice: CookieChoice) {
  write(COOKIE_KEY, { choice, at: Date.now() } satisfies StoredCookie);
}

// Called right before an account is created or a provider sign-in starts,
// once the 18+ and terms boxes are ticked. Written to the DB after sign-in.
export function stashAuthConsent() {
  write(AUTH_CONSENT_KEY, { at: Date.now(), version: POLICY_VERSION } satisfies StoredAuth);
}

export function clearAuthConsent() {
  try {
    localStorage.removeItem(AUTH_CONSENT_KEY);
  } catch {}
}

// Pushes whatever consent was captured on this device to the signed-in
// user's private record. Safe to call repeatedly; no-ops when nothing is new.
export async function syncConsent(uid: string): Promise<void> {
  const ref = consentRef(uid);
  if (!ref) return;
  const cookie = read<StoredCookie>(COOKIE_KEY);
  const auth = read<StoredAuth>(AUTH_CONSENT_KEY);
  const cookieDue = cookie && cookie.syncedUid !== uid;
  if (!cookieDue && !auth) return;

  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (cookieDue) {
    data.cookies = cookie.choice;
    data.cookiesAt = Timestamp.fromMillis(cookie.at);
  }
  if (auth) {
    data.ageConfirmed = true;
    data.termsAcceptedAt = Timestamp.fromMillis(auth.at);
    data.privacyAcceptedAt = Timestamp.fromMillis(auth.at);
    data.policyVersion = auth.version;
  }
  await setDoc(ref, data, { merge: true });

  if (cookieDue) write(COOKIE_KEY, { ...cookie, syncedUid: uid });
  if (auth) {
    try {
      localStorage.removeItem(AUTH_CONSENT_KEY);
    } catch {}
  }
}
