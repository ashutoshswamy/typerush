"use client";

import Link from "next/link";
import { Keyboard, Trophy, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function NavBar() {
  const { user, configured, signOut } = useAuth();

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-4 text-xs tracking-[0.15em] uppercase text-sub">
      <Link href="/" className="font-display flex items-center gap-2.5 text-main font-bold tracking-[0.1em] normal-case text-base">
        <span
          className="w-1.5 h-1.5 rounded-full bg-main animate-pulse"
          style={{ boxShadow: "0 0 6px var(--main)" }}
          aria-hidden="true"
        />
        typerush
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/type" className="flex items-center gap-1.5 text-main hover:text-text transition-colors">
          <Keyboard size={14} aria-hidden="true" />
          type
        </Link>
        <Link href="/leaderboard" className="flex items-center gap-1.5 hover:text-text transition-colors">
          <Trophy size={14} aria-hidden="true" />
          leaderboard
        </Link>
        {configured && user && (
          <Link
            href={`/profile/${user.displayName ?? user.uid}`}
            className="flex items-center gap-1.5 hover:text-text transition-colors"
          >
            <User size={14} aria-hidden="true" />
            profile
          </Link>
        )}
        <Link href="/account" className="flex items-center gap-1.5 hover:text-text transition-colors">
          <Settings size={14} aria-hidden="true" />
          account
        </Link>
        {configured && user && (
          <button onClick={() => signOut()} className="flex items-center gap-1.5 hover:text-text transition-colors">
            <LogOut size={14} aria-hidden="true" />
            sign out
          </button>
        )}
      </nav>
      <span className="graticule absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </header>
  );
}
