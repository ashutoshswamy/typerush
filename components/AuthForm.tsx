"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { useAuth } from "./AuthProvider";
import { Panel } from "./Panel";

export function AuthForm() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, configured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
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
    setBusy(true);
    try {
      if (mode === "signup") await signUpWithEmail(email, password, username);
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
    <Panel className="flex flex-col gap-4 max-w-xs px-6 py-5">
      <div className="flex gap-4 text-xs tracking-[0.15em] uppercase text-sub">
        <button
          onClick={() => setMode("signin")}
          className={mode === "signin" ? "text-main" : "hover:text-text"}
        >
          sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "text-main" : "hover:text-text"}
        >
          sign up
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2">
        {mode === "signup" && (
          <input
            className="bg-sub-alt border border-sub/30 px-3 py-2 text-sm outline-none focus:border-main"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          className="bg-sub-alt border border-sub/30 px-3 py-2 text-sm outline-none focus:border-main"
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="bg-sub-alt border border-sub/30 px-3 py-2 text-sm outline-none focus:border-main"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-1.5 bg-main text-bg px-3 py-2 text-xs tracking-[0.15em] uppercase font-medium disabled:opacity-50"
        >
          <LogIn size={14} aria-hidden="true" />
          {mode === "signup" ? "create account" : "sign in"}
        </button>
      </form>

      <button
        onClick={() => withPopup(signInWithGoogle)}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 border border-sub/40 px-3 py-2 text-xs tracking-[0.15em] uppercase hover:text-main hover:border-main disabled:opacity-50"
      >
        <FaGoogle size={13} aria-hidden="true" />
        continue with Google
      </button>
      <button
        onClick={() => withPopup(signInWithGithub)}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 border border-sub/40 px-3 py-2 text-xs tracking-[0.15em] uppercase hover:text-main hover:border-main disabled:opacity-50"
      >
        <FaGithub size={14} aria-hidden="true" />
        continue with GitHub
      </button>

      {error && <p className="text-error text-xs">{error}</p>}
    </Panel>
  );
}
