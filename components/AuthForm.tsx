"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { useAuth } from "./AuthProvider";
import { Panel } from "./Panel";
import { PasswordInput } from "./PasswordInput";

export function AuthForm() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, configured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <p className="text-sub text-sm">
        Firebase not configured — add credentials to <code>.env.local</code> to enable
        accounts. Running in guest mode.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") await signUpWithEmail(email, password);
      else await signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function withPopup(fn: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-4 w-full max-w-xs px-6 py-5">
      <div className="flex gap-5 text-xs tracking-[0.15em] uppercase text-sub border-b border-sub/15">
        <button
          onClick={() => setMode("signin")}
          className={`relative pb-2 transition-colors ${mode === "signin" ? "text-main" : "hover:text-text"}`}
        >
          sign in
          {mode === "signin" && (
            <motion.span
              layoutId="authform-tab-underline"
              className="absolute -bottom-px left-0 right-0 h-px bg-main"
              style={{ boxShadow: "0 0 4px var(--main)" }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`relative pb-2 transition-colors ${mode === "signup" ? "text-main" : "hover:text-text"}`}
        >
          sign up
          {mode === "signup" && (
            <motion.span
              layoutId="authform-tab-underline"
              className="absolute -bottom-px left-0 right-0 h-px bg-main"
              style={{ boxShadow: "0 0 4px var(--main)" }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <input
          className="bg-sub-alt border border-sub/30 px-3 py-2 text-sm outline-none focus:border-main"
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput value={password} onChange={setPassword} placeholder="password" minLength={6} />
        {mode === "signup" && (
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="confirm password"
            minLength={6}
          />
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-1.5 bg-main text-bg px-3 py-2 text-xs tracking-[0.15em] uppercase font-medium disabled:opacity-50"
        >
          <LogIn size={14} aria-hidden="true" />
          {mode === "signup" ? "create account" : "sign in"}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 text-sub/50 text-[10px] tracking-[0.15em] uppercase">
        <span className="graticule flex-1" aria-hidden="true" />
        or
        <span className="graticule flex-1" aria-hidden="true" />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => withPopup(signInWithGoogle)}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 border border-sub/40 px-3 py-2 text-xs tracking-[0.15em] uppercase hover:text-main hover:border-main disabled:opacity-50"
      >
        <FaGoogle size={13} aria-hidden="true" />
        continue with Google
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => withPopup(signInWithGithub)}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 border border-sub/40 px-3 py-2 text-xs tracking-[0.15em] uppercase hover:text-main hover:border-main disabled:opacity-50"
      >
        <FaGithub size={14} aria-hidden="true" />
        continue with GitHub
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-error text-xs"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </Panel>
  );
}
