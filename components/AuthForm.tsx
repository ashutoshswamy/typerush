"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { useAuth } from "./AuthProvider";
import { Panel } from "./Panel";
import { PasswordInput } from "./PasswordInput";
import { Checkbox } from "./Checkbox";
import Link from "next/link";
import { notify } from "@/lib/toast";
import { stashAuthConsent, clearAuthConsent } from "@/lib/consent";

export function AuthForm() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, configured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
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
    if (mode === "signup" && !consentOk()) return;
    if (mode === "signup" && password !== confirmPassword) {
      notify.error("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        stashAuthConsent(); // saved to the DB once the account exists
        await signUpWithEmail(email, password);
      }
      else await signInWithEmail(email, password);
      notify.success(mode === "signup" ? "Account created" : "Welcome back");
    } catch (err) {
      clearAuthConsent();
      notify.error("Couldn't sign in", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  // Age + terms must be confirmed before any account can be created, which
  // includes first-time Google/GitHub sign-in (we can't tell new from returning).
  function consentOk() {
    if (isAdult && acceptsTerms) return true;
    notify.warning(
      "One more step",
      !isAdult ? "Confirm you are 18 or older to continue." : "Accept the Terms of Service and Privacy Policy to continue."
    );
    return false;
  }

  async function withPopup(fn: () => Promise<void>) {
    if (!consentOk()) return;
    setBusy(true);
    try {
      stashAuthConsent();
      await fn();
      notify.success("Signed in");
    } catch (err) {
      clearAuthConsent();
      notify.error("Couldn't sign in", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="flex flex-col gap-4 w-full max-w-sm px-6 py-6">
      <div className="flex gap-5 text-xs text-sub border-b border-sub/15">
        <button
          onClick={() => setMode("signin")}
          className={`relative pb-2 transition-colors ${mode === "signin" ? "text-main" : "hover:text-text"}`}
        >
          sign in
          {mode === "signin" && (
            <motion.span
              layoutId="authform-tab-underline"
              className="absolute -bottom-px left-0 right-0 h-px bg-main"
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
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <input
          className="bg-sub-alt rounded-xl border border-sub/30 px-3 py-2.5 text-sm outline-none focus:border-main"
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
          className="flex items-center justify-center gap-1.5 rounded-xl bg-main text-bg px-3 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <LogIn size={14} aria-hidden="true" />
          {mode === "signup" ? "create account" : "sign in"}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 text-sub/50 text-[10px]">
        <span className="h-px flex-1 bg-sub/20" aria-hidden="true" />
        or
        <span className="h-px flex-1 bg-sub/20" aria-hidden="true" />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => withPopup(signInWithGoogle)}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-sub/40 px-3 py-2.5 text-sm hover:text-main hover:border-main disabled:opacity-50"
      >
        <FaGoogle size={13} aria-hidden="true" />
        continue with Google
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => withPopup(signInWithGithub)}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-sub/40 px-3 py-2.5 text-sm hover:text-main hover:border-main disabled:opacity-50"
      >
        <FaGithub size={14} aria-hidden="true" />
        continue with GitHub
      </motion.button>

      <div className="flex flex-col gap-3 border-t border-sub/15 pt-4 text-sm text-text/70">
        <label className="flex items-start gap-2.5 cursor-pointer leading-snug">
          <span className="mt-0.5"><Checkbox checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} /></span>
          I am 18 years of age or older.
        </label>
        <label className="flex items-start gap-2.5 cursor-pointer leading-snug">
          <span className="mt-0.5"><Checkbox checked={acceptsTerms} onChange={(e) => setAcceptsTerms(e.target.checked)} /></span>
          <span>
            I accept the{" "}
            <Link href="/terms" target="_blank" className="text-main underline underline-offset-2">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="text-main underline underline-offset-2">Privacy Policy</Link>.
          </span>
        </label>
      </div>
    </Panel>
  );
}
