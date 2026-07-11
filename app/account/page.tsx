"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AuthForm } from "@/components/AuthForm";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Panel } from "@/components/Panel";
import { DangerZone } from "@/components/DangerZone";
import { SectionLabel } from "@/components/SectionLabel";
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
  "google.com": { icon: FaGoogle, label: "google" },
  "github.com": { icon: FaGithub, label: "github" },
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
        className="flex flex-col items-center text-center gap-8 max-w-md mx-auto py-24 w-full"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <h1 className="font-display text-4xl sm:text-5xl text-text tracking-tight leading-none">Sign in to calibrate</h1>
          <p className="text-sub text-sm max-w-sm">
            History, personal bests, and theme calibration live behind your channel — sign in or open one to start logging runs.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="w-full flex justify-center">
          <AuthForm />
        </motion.div>
      </motion.div>
    );
  }

  const memberSince = user.metadata.creationTime ? formatDate(new Date(user.metadata.creationTime)) : null;
  const providerId = user.providerData[0]?.providerId ?? "password";
  const provider = PROVIDER_META[providerId] ?? PROVIDER_META.password;
  const ProviderIcon = provider.icon;
  const serial = user.uid.slice(-6).toUpperCase();

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex flex-col gap-10 max-w-5xl mx-auto py-14 w-full">
      {/* Spec plate — same instrument-ID-stamp language as the public profile's
          identity block, so a signed-in user's own console reads as the same
          rig they show the world, not a smaller consolation version of it. */}
      <motion.div variants={fadeUp}>
        <Panel className="flex flex-wrap items-center gap-6 sm:gap-10 px-6 py-6">
          <Avatar src={user.photoURL} label={username} size={64} />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <h1 className="font-display text-4xl sm:text-5xl text-main tracking-tight truncate leading-none">
              {username}
            </h1>
            <div className="font-test flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] tracking-[0.15em] uppercase text-sub">
              {memberSince && <span>racing since {memberSince}</span>}
              <span className="flex items-center gap-1.5">
                <ProviderIcon size={11} aria-hidden="true" />
                {provider.label}
              </span>
              <span>id·{serial}</span>
            </div>
          </div>
          <LevelBadge xp={profile?.xp ?? 0} />
          <button
            onClick={() => signOut()}
            className="font-test flex items-center gap-1.5 text-sub hover:text-error transition-colors text-[11px] tracking-[0.15em] uppercase shrink-0"
          >
            <LogOut size={13} aria-hidden="true" />
            sign out
          </button>
        </Panel>
      </motion.div>

      <motion.div variants={fadeUp}>
        <RaceInvitesPanel uid={user.uid} username={username} photoURL={user.photoURL ?? null} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <FriendsPanel uid={user.uid} username={username} photoURL={user.photoURL ?? null} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <SectionLabel>calibration</SectionLabel>
        <SettingsPanel />
      </motion.div>

      <motion.div variants={fadeUp}>
        <DangerZone uid={user.uid} username={username} />
      </motion.div>
    </motion.div>
  );
}
