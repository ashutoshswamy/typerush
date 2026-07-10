"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";

// One place route changes get a beat — a quick fade/rise, not a slide show.
// Keyed on pathname so AnimatePresence treats each route as its own exit/enter.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col flex-1 justify-center"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
