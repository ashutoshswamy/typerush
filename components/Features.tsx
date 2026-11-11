"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSettings } from "@/store/settings";
import { DARK_THEMES, LIGHT_THEMES, THEME_ACCENT } from "@/lib/themes";
import { xpForLevel } from "@/lib/xp";
import { EASE } from "@/lib/motion";

const SWATCHES = [...DARK_THEMES.slice(0, 8), ...LIGHT_THEMES.slice(0, 4)];

// Real curve from the app's own level function, levels 1 to 20.
const CURVE_LEVELS = 20;
const CURVE_W = 220;
const CURVE_H = 84;
const curveTop = xpForLevel(CURVE_LEVELS);
const CURVE_POINTS = Array.from({ length: CURVE_LEVELS }, (_, i) => {
  const x = (i / (CURVE_LEVELS - 1)) * CURVE_W;
  const y = CURVE_H - (xpForLevel(i + 1) / curveTop) * (CURVE_H - 6) - 3;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ");

function Tile({
  className = "",
  index,
  children,
}: {
  className?: string;
  index: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 }}
      className={`rounded-[1.25rem] p-7 sm:p-9 flex flex-col justify-between gap-8 min-h-64 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Features() {
  const { theme, setTheme } = useSettings();

  return (
    <section className="max-w-6xl mx-auto w-full px-4 pb-24">
      <div className="mb-10 max-w-xl">
        <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-text leading-[1.05]">
          Built for the long run
        </h2>
        <p className="mt-4 text-lg text-text/65 leading-relaxed">
          Come back daily. Every test earns XP and every race counts toward your rank.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Tile index={0} className="surface lg:col-span-7">
          <div className="flex flex-wrap gap-2.5">
            {SWATCHES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                aria-label={`Use the ${t} theme`}
                aria-pressed={theme === t}
                className={`h-9 w-9 rounded-full border transition-transform hover:scale-110 active:scale-95 ${
                  theme === t ? "border-text ring-2 ring-main ring-offset-2 ring-offset-sub-alt" : "border-sub/30"
                }`}
                style={{ background: THEME_ACCENT[t] }}
              />
            ))}
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-text">40 themes</h3>
            <p className="mt-2 max-w-md text-text/65">Twenty dark, twenty light. Tap a color to try it on this page.</p>
          </div>
        </Tile>

        <Tile index={1} className="surface lg:col-span-5">
          <svg viewBox={`0 0 ${CURVE_W} ${CURVE_H}`} className="w-full h-24" aria-hidden="true" preserveAspectRatio="none">
            <polyline
              points={CURVE_POINTS}
              fill="none"
              stroke="var(--main)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div>
            <h3 className="font-display text-2xl font-bold text-text">Levels and streaks</h3>
            <p className="mt-2 text-text/65">Each test earns XP, and each level asks for a little more. Type daily to keep your streak alive.</p>
          </div>
        </Tile>

        <Tile index={2} className="bg-main/12 border border-main/25 lg:col-span-5">
          <span className="font-display text-7xl sm:text-8xl font-extrabold leading-none tracking-tight text-main">
            1v1
          </span>
          <div>
            <h3 className="font-display text-2xl font-bold text-text">Live friend races</h3>
            <p className="mt-2 text-text/65">Invite a friend, pick the mode, and watch their progress move as you type.</p>
          </div>
        </Tile>

        <Tile index={3} className="surface lg:col-span-7">
          <span className="font-display text-7xl sm:text-8xl font-extrabold leading-none tracking-tight text-text/90">
            #1
          </span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-text">Global leaderboard</h3>
              <p className="mt-2 max-w-md text-text/65">Filter by mode and length, and see every racer&rsquo;s level.</p>
            </div>
            <Link
              href="/leaderboard"
              className="group flex items-center gap-1.5 rounded-xl border border-sub/40 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-main hover:text-main"
            >
              View leaderboard
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </div>
        </Tile>
      </div>
    </section>
  );
}
