"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type AuthProvider as FirebaseAuthProvider,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, githubProvider, firebaseConfigured } from "@/lib/firebase";
import { deleteUserData, sanitizeUsername } from "@/lib/firestore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PROVIDER_LABEL: Record<string, string> = {
  password: "email and password",
  "google.com": "Google",
  "github.com": "GitHub",
};

// Firebase treats each provider as a separate identity by default. If this
// email already has an account under a different provider, surface which
// one instead of letting the raw FirebaseError bubble up unhandled.
async function popupSignIn(provider: FirebaseAuthProvider) {
  if (!auth) throw new Error("Firebase not configured");
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    const code = (err as { code?: string }).code;
    const email = (err as { customData?: { email?: string } }).customData?.email;
    if (code === "auth/account-exists-with-different-credential" && email) {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      const label = methods.map((m) => PROVIDER_LABEL[m] ?? m).join(" or ");
      throw new Error(
        label
          ? `This email already has an account via ${label}. Sign in that way instead.`
          : "This email is already linked to a different sign-in method."
      );
    }
    throw err;
  }
}

async function ensureUserDoc(user: User) {
  if (!db) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      username: sanitizeUsername(user.displayName ?? user.email?.split("@")[0] ?? "racer"),
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
      themePref: "ayu",
      xp: 0,
      usernameSet: false, // provider-supplied name — UsernamePrompt asks them to confirm/change it
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) void ensureUserDoc(u);
    });
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    configured: firebaseConfigured,
    signInWithGoogle: () => popupSignIn(googleProvider),
    signInWithGithub: () => popupSignIn(githubProvider),
    signUpWithEmail: async (email, password) => {
      if (!auth || !db) throw new Error("Firebase not configured");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        username: sanitizeUsername(email.split("@")[0] ?? "racer"),
        photoURL: null,
        createdAt: serverTimestamp(),
        themePref: "ayu",
        xp: 0,
        usernameSet: false, // no username collected at signup — UsernamePrompt asks right after
      });
    },
    signInWithEmail: async (email, password) => {
      if (!auth) throw new Error("Firebase not configured");
      await signInWithEmailAndPassword(auth, email, password);
    },
    signOut: async () => {
      if (!auth) return;
      await fbSignOut(auth);
    },
    deleteAccount: async (password) => {
      if (!auth?.currentUser) throw new Error("Not signed in");
      const current = auth.currentUser;
      await deleteUserData(current.uid);
      try {
        await deleteUser(current); // last: Auth deletion can't be undone if Firestore purge fails first
      } catch (err) {
        if ((err as { code?: string }).code !== "auth/requires-recent-login") throw err;
        // Delete is a sensitive op — Firebase demands a fresh sign-in before
        // it'll allow it. Reauthenticate in place instead of forcing the
        // user to sign out and back in.
        const providerId = current.providerData[0]?.providerId;
        if (providerId === "google.com") await reauthenticateWithPopup(current, googleProvider);
        else if (providerId === "github.com") await reauthenticateWithPopup(current, githubProvider);
        else if (providerId === "password" && password && current.email) {
          await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, password));
        } else {
          throw err;
        }
        await deleteUser(current);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
