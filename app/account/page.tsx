"use client";

import { useAuth } from "@/components/AuthProvider";
import { AuthForm } from "@/components/AuthForm";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Panel } from "@/components/Panel";
import { DangerZone } from "@/components/DangerZone";
import { SectionLabel } from "@/components/SectionLabel";
import { Avatar } from "@/components/Avatar";

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex flex-col gap-10 max-w-3xl mx-auto py-14 w-full">
        <h1 className="font-display text-4xl text-text tracking-tight">Account</h1>
        <AuthForm />
      </div>
    );
  }

  const memberSince = user.metadata.creationTime ? formatDate(new Date(user.metadata.creationTime)) : null;

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-14 w-full">
      <h1 className="font-display text-4xl text-text tracking-tight">Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-10 items-start">
        <div className="flex flex-col gap-10">
          <div>
            <SectionLabel>identity</SectionLabel>
            <Panel className="flex items-center gap-4 px-5 py-4">
              <Avatar src={user.photoURL} label={user.displayName ?? user.email ?? "?"} />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-text text-sm truncate">{user.displayName ?? user.email}</span>
                {memberSince && (
                  <span className="text-sub text-xs tracking-[0.08em] uppercase">racing since {memberSince}</span>
                )}
                <button onClick={() => signOut()} className="text-sub hover:text-main transition-colors text-xs tracking-[0.1em] uppercase w-fit mt-1">
                  sign out
                </button>
              </div>
            </Panel>
          </div>

          <div>
            <DangerZone uid={user.uid} username={user.displayName ?? user.uid} />
          </div>
        </div>

        <div className="min-w-0">
          <SectionLabel>calibration</SectionLabel>
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
}
