"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Swords } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar } from "./Avatar";
import { Panel } from "./Panel";
import { SectionLabel } from "./SectionLabel";
import {
  listenRaceInvites,
  acceptRaceInvite,
  declineRaceInvite,
  expireRace,
  type RaceInvite,
} from "@/lib/firestore";

const INVITE_TIMEOUT_S = 30;

function InviteRow({
  invite,
  busy,
  onAccept,
  onDecline,
  onExpire,
}: {
  invite: RaceInvite;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(INVITE_TIMEOUT_S);
  const expiredRef = useRef(false);

  // No Cloud Functions in this project — whichever client (this inbox, or
  // the host's own waiting room) notices 30s pass first discards the invite.
  useEffect(() => {
    const createdMs = invite.createdAt?.toMillis?.() ?? Date.now();
    const tick = () => {
      const left = INVITE_TIMEOUT_S - Math.floor((Date.now() - createdMs) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite.raceId]);

  return (
    <div className="flex items-center gap-2.5">
      <Avatar src={invite.fromPhotoURL} label={invite.fromUsername} size={28} />
      <span className="flex-1 text-sm text-text truncate">
        <span className="text-main">{invite.fromUsername}</span> invited you to race
      </span>
      <span className="font-test text-sub text-[10px] tabular-nums w-6 text-right shrink-0">{remaining}s</span>
      <button
        onClick={onAccept}
        disabled={busy}
        className="font-test flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-main hover:text-text disabled:opacity-40 transition-colors"
      >
        <Swords size={12} aria-hidden="true" />
        {busy ? "joining…" : "accept"}
      </button>
      <button
        onClick={onDecline}
        disabled={busy}
        className="flex items-center justify-center w-6 h-6 border border-sub/40 text-sub hover:text-error hover:border-error disabled:opacity-40 transition-colors"
        aria-label="decline"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function RaceInvitesPanel({ uid, username, photoURL }: { uid: string; username: string; photoURL: string | null }) {
  const { user } = useAuth();
  const router = useRouter();
  const [invites, setInvites] = useState<RaceInvite[]>([]);
  const [busyRaceId, setBusyRaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => listenRaceInvites(uid, setInvites), [uid]);

  if (invites.length === 0) return null;

  async function accept(invite: RaceInvite) {
    if (!user) return;
    setError(null);
    setBusyRaceId(invite.raceId);
    try {
      await acceptRaceInvite(uid, username, photoURL, invite);
      router.push(`/race/${invite.raceId}`);
    } catch (err) {
      console.error("accept race invite failed:", err);
      setError(err instanceof Error ? err.message : "Couldn't accept invite");
      setBusyRaceId(null);
    }
  }

  async function decline(invite: RaceInvite) {
    setError(null);
    setBusyRaceId(invite.raceId);
    try {
      await declineRaceInvite(uid, invite.raceId);
    } catch (err) {
      console.error("decline race invite failed:", err);
      setError(err instanceof Error ? err.message : "Couldn't decline invite");
    } finally {
      setBusyRaceId(null);
    }
  }

  function expire(invite: RaceInvite) {
    declineRaceInvite(uid, invite.raceId).catch(() => {});
    expireRace(invite.raceId).catch(() => {});
  }

  return (
    <div>
      <SectionLabel>race invites</SectionLabel>
      <Panel className="p-4 flex flex-col gap-2.5">
        {invites.map((invite) => (
          <InviteRow
            key={invite.raceId}
            invite={invite}
            busy={busyRaceId === invite.raceId}
            onAccept={() => accept(invite)}
            onDecline={() => decline(invite)}
            onExpire={() => expire(invite)}
          />
        ))}
        {error && <p className="text-error text-xs">{error}</p>}
      </Panel>
    </div>
  );
}
