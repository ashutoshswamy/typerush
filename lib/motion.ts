import type { Variants, Transition } from "framer-motion";

// Shared framer-motion variants and easing. Timeline-style reveals (results
// count-up, oscilloscope draw-in, gauge sweep) use framer-motion's `animate()`
// inside effects, see Results.tsx / Oscilloscope.tsx / Gauge.tsx.
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
