"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { COOKIE_KEY, saveCookieChoice, syncConsent, type CookieChoice } from "@/lib/consent";


// Only essential storage exists today (sign-in session, theme, settings).
// The choice is still recorded so any future optional cookies stay opt-in.
export function CookieConsent() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Deferred so first paint matches SSR (no hydration mismatch).
    const t = setTimeout(() => {
      try {
        if (!localStorage.getItem(COOKIE_KEY)) setOpen(true);
      } catch {
        setOpen(true);
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  function choose(choice: CookieChoice) {
    saveCookieChoice(choice);
    setOpen(false);
    // Signed in already? Record it now. Otherwise it is saved at sign-in.
    if (user) syncConsent(user.uid).catch((err) => console.warn("consent sync failed:", err));
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="surface fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-50 p-5 flex flex-col gap-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <Cookie size={20} className="text-main shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-text/85 leading-relaxed">
              We use essential cookies and local storage to keep you signed in and remember your theme. Details in
              our{" "}
              <Link href="/privacy" className="text-main underline underline-offset-2">
                privacy policy
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => choose("all")}
              className="flex-1 rounded-xl bg-main px-4 py-2.5 text-sm font-semibold text-bg hover:brightness-110 transition-[filter]"
            >
              Accept
            </button>
            <button
              onClick={() => choose("essential")}
              className="flex-1 rounded-xl border border-sub/40 px-4 py-2.5 text-sm font-medium text-text hover:border-main hover:text-main transition-colors"
            >
              Essential only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
