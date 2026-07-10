import type { Variants, Transition } from "framer-motion";

// Shared framer-motion variants — the declarative, non-orchestrated motion
// layer used across pages/lists. Timeline-driven reveals (hero sweep,
// results count-up, oscilloscope draw-in) stay on GSAP, see Results.tsx /
// Oscilloscope.tsx / app/page.tsx.
export const EASE: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
