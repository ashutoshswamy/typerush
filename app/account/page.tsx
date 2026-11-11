"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Check } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AuthForm } from "@/components/AuthForm";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Panel } from "@/components/Panel";
import { DangerZone } from "@/components/DangerZone";
import { SectionLabel } from "@/components/SectionLabel";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { LevelBadge } from "@/components/LevelBadge";
import { FriendsPanel } from "@/components/FriendsPanel";
import { RaceInvitesPanel } from "@/components/RaceInvitesPanel";
import { listenUserProfile, type UserProfile } from "@/lib/firestore";
import { fadeUp, staggerContainer } from "@/lib/motion";

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

const PROVIDER_META: Record<string, { icon: React.ElementType; label: string }> = {
  "google.com": { icon: FaGoogle, label: "Google" },
  "github.com": { icon: FaGithub, label: "GitHub" },
  password: { icon: Mail, label: "email" },
};

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    return listenUserProfile(user.uid, setProfile);
  }, [user]);

  const username = profile?.username ?? user?.displayName ?? user?.email ?? "racer";

  if (loading) return null;

  if (!user) {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="mx-auto grid w-full max-w-5xl items-center gap-12 py-12 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20"
      >
        <motion.div variants={fadeUp} className="flex flex-col gap-8">
          <PageHeader
            title="Sign in to keep your runs"
            description="Your history, personal bests, friends and race invites, all in one place."
          />
          <ul className="flex flex-col gap-4 text-text/85">
            {[
              "Save every test and track your personal bests",
              "Add friends and race them live, 1v1",
              "Earn XP, level up and join the leaderboard",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-main/15 text-main">
                  <Check size={14} aria-hidden="true" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp} className="flex w-full justify-center lg:justify-end">
          <AuthForm />
        </motion.div>
      </motion.div>
    );
  }

  const memberSince = user.metadata.creationTime ? formatDate(new Date(user.metadata.creationTime)) : null;
  const providerId = user.providerData[0]?.providerId ?? "password";
  const provider = PROVIDER_META[providerId] ?? PROVIDER_META.password;
  const ProviderIcon = provider.icon;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-12 sm:py-16"
    >
      <motion.div variants={fadeUp}>
        <Panel className="flex flex-wrap items-center gap-6 p-6 sm:p-8">
          <Avatar src={user.photoURL} label={username} size={72} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-text">
              {username}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sub">
              {memberSince && <span>Member since {memberSince}</span>}
              <span className="flex items-center gap-1.5">
                <ProviderIcon size={13} aria-hidden="true" />
                Signed in with {provider.label}
              </span>
            </p>
          </div>
          <LevelBadge xp={profile?.xp ?? 0} />
          <button
            onClick={() => signOut()}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-sub/40 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-error hover:text-error"
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </Panel>
      </motion.div>

      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-8">
          <motion.div variants={fadeUp}>
            <RaceInvitesPanel uid={user.uid} username={username} photoURL={user.photoURL ?? null} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <FriendsPanel uid={user.uid} username={username} photoURL={user.photoURL ?? null} />
          </motion.div>
        </div>
        <div className="flex flex-col gap-8">
          <motion.div variants={fadeUp}>
            <SectionLabel>Settings</SectionLabel>
            <SettingsPanel />
          </motion.div>
          <motion.div variants={fadeUp}>
            <DangerZone uid={user.uid} username={username} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
