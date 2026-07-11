"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Keyboard, Trophy, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { listenUserProfile, type UserProfile } from "@/lib/firestore";
import { LevelBadge } from "./LevelBadge";
import { RaceInviteBell } from "./RaceInviteBell";

function NavLink({
  href,
  active,
  highlight,
  children,
}: {
  href: string;
  active: boolean;
  highlight?: boolean; // always main-colored regardless of route, e.g. the primary "type" CTA
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`relative flex items-center gap-1.5 py-1 transition-colors ${highlight || active ? "text-main" : "hover:text-text"}`}>
      {children}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-px bg-main"
          style={{ boxShadow: "0 0 4px var(--main)" }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
    </Link>
  );
}

export function NavBar() {
  const { user, configured, signOut } = useAuth();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!configured || !user) return;
    return listenUserProfile(user.uid, setProfile);
  }, [configured, user]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex items-center justify-between px-6 py-4 text-xs tracking-[0.15em] uppercase text-sub"
    >
      <Link href="/" className="font-display flex items-center gap-2.5 text-main font-bold tracking-[0.1em] normal-case text-base">
        <span
          className="w-1.5 h-1.5 rounded-full bg-main animate-pulse"
          style={{ boxShadow: "0 0 6px var(--main)" }}
          aria-hidden="true"
        />
        typerush
      </Link>
      <nav className="flex items-center gap-6">
        <NavLink href="/type" active={pathname === "/type"} highlight>
          <Keyboard size={14} aria-hidden="true" />
          type
        </NavLink>
        <NavLink href="/leaderboard" active={pathname === "/leaderboard"}>
          <Trophy size={14} aria-hidden="true" />
          leaderboard
        </NavLink>
        {configured && user && profile && (
          <NavLink href={`/profile/${profile.username}`} active={pathname.startsWith("/profile")}>
            <User size={14} aria-hidden="true" />
            profile
          </NavLink>
        )}
        <NavLink href="/account" active={pathname === "/account"}>
          <Settings size={14} aria-hidden="true" />
          account
        </NavLink>
        {configured && user && (
          <>
            <RaceInviteBell />
            <LevelBadge xp={profile?.xp ?? 0} size="sm" />
            <button onClick={() => signOut()} className="flex items-center gap-1.5 hover:text-text transition-colors">
              <LogOut size={14} aria-hidden="true" />
              sign out
            </button>
          </>
        )}
      </nav>
      <span className="graticule absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </motion.header>
  );
}
