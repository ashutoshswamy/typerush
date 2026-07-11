"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Panel } from "./Panel";
import { listenUserProfile, setUsername as setUsernameDoc, USERNAME_PATTERN } from "@/lib/firestore";

// Google/GitHub sign-in auto-fills a username from the provider profile —
// this gates the whole app once, right after that first sign-in, until the
// user picks their own (or confirms the suggested one).
export function UsernamePrompt() {
  const { user } = useAuth();
  const [needsUsername, setNeedsUsername] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    return listenUserProfile(user.uid, (profile) => {
      if (profile?.usernameSet === false) {
        setNeedsUsername(true);
        setValue((v) => v || profile.username);
      } else {
        setNeedsUsername(false);
      }
    });
  }, [user]);

  if (!user || !needsUsername) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      await setUsernameDoc(user.uid, value.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm px-4"
      >
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Panel className="flex flex-col gap-4 w-full max-w-xs px-6 py-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl text-main leading-none">pick a username</h2>
              <p className="text-sub text-xs">Shown on your profile and the leaderboard — choose one before racing.</p>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-2">
              <input
                autoFocus
                className="bg-sub-alt border border-sub/30 px-3 py-2 text-sm outline-none focus:border-main"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3-20 characters: letters, numbers, and underscores only"
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-sub/70 text-[10px]">letters, numbers, underscores — 3-20 characters</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={busy || !USERNAME_PATTERN.test(value.trim())}
                className="flex items-center justify-center gap-1.5 bg-main text-bg px-3 py-2 text-xs tracking-[0.15em] uppercase font-medium disabled:opacity-50"
              >
                <Check size={14} aria-hidden="true" />
                {busy ? "saving…" : "confirm"}
              </motion.button>
              {error && <p className="text-error text-xs">{error}</p>}
            </form>
          </Panel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
