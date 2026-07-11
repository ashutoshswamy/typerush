"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { listenRaceInvites } from "@/lib/firestore";

// Just a live count — the actual accept/decline inbox lives on /account
// (RaceInvitesPanel) so it doesn't interrupt whatever page the user's on.
export function RaceInviteBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    return listenRaceInvites(user.uid, (invites) => setCount(invites.length));
  }, [user]);

  if (!user) return null;

  return (
    <Link href="/account" className="relative flex items-center gap-1.5 hover:text-text transition-colors">
      <Swords size={14} aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-2 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-error text-bg text-[9px] font-bold"
          style={{ boxShadow: "0 0 4px var(--error)" }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
