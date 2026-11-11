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
import { notify } from "@/lib/toast";
import { Logo } from "./Logo";

function NavLink({
  href,
  active,
  highlight,
  children,
}: {
  href: string;
  active: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
        highlight || active ? "text-main" : "text-sub hover:text-text"
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-main/12"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">{children}</span>
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
      className="relative z-20 flex h-16 items-center justify-between gap-3 px-4 sm:px-6"
    >
      <Logo textClassName="hidden min-[420px]:inline text-xl" />
      <nav className="flex items-center gap-0.5 sm:gap-1">
        <NavLink href="/type" active={pathname === "/type"} highlight>
          <Keyboard size={15} aria-hidden="true" />
          <span className="hidden sm:inline">type</span>
        </NavLink>
        <NavLink href="/leaderboard" active={pathname === "/leaderboard"}>
          <Trophy size={15} aria-hidden="true" />
          <span className="hidden sm:inline">leaderboard</span>
        </NavLink>
        {configured && user && profile && (
          <NavLink href={`/profile/${profile.username}`} active={pathname.startsWith("/profile")}>
            <User size={15} aria-hidden="true" />
            <span className="hidden sm:inline">profile</span>
          </NavLink>
        )}
        <NavLink href="/account" active={pathname === "/account"}>
          <Settings size={15} aria-hidden="true" />
          <span className="hidden sm:inline">account</span>
        </NavLink>
        {configured && user && (
          <>
            <RaceInviteBell />
            <span className="hidden sm:block mx-2">
              <LevelBadge xp={profile?.xp ?? 0} size="sm" />
            </span>
            <button
              onClick={() => {
                signOut().then(() => notify.info("Signed out", "See you next run."));
              }}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-sub hover:text-text transition-colors sm:px-3"
            >
              <LogOut size={15} aria-hidden="true" />
              <span className="hidden sm:inline">sign out</span>
            </button>
          </>
        )}
      </nav>
    </motion.header>
  );
}
