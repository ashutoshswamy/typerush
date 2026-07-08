"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Gauge, Target, Activity, Timer, Type, Quote, Leaf, Check, type LucideIcon } from "lucide-react";
import { Panel } from "@/components/Panel";
import { TriggerButton } from "@/components/TriggerButton";
import { SignalBar } from "@/components/SignalBar";
import { SectionLabel } from "@/components/SectionLabel";
import { Oscilloscope } from "@/components/Oscilloscope";
import { THEMES, THEME_ACCENT } from "@/lib/themes";
import { useSettings } from "@/store/settings";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Authored, not live — this is the landing page, before anyone has typed
// anything. The app's own Oscilloscope only ever plots a real wpmTimeline.
const HERO_WAVE = [14, 20, 16, 24, 32, 27, 35, 44, 39, 48, 54, 49, 57, 66, 59, 63, 71, 67, 73, 79, 75, 82];
const HERO_W = 600;
const HERO_H = 160;
const HERO_MIN = Math.min(...HERO_WAVE);
const HERO_MAX = Math.max(...HERO_WAVE);
const HERO_PAD = 12; // vertical padding baked into the y mapping below

function valueToY(v: number, height: number) {
  const range = HERO_MAX - HERO_MIN || 1;
  return height - ((v - HERO_MIN) / range) * (height - HERO_PAD) - HERO_PAD / 2;
}

function heroPoints(width: number, height: number): [number, number][] {
  return HERO_WAVE.map((v, i) => [(i / (HERO_WAVE.length - 1)) * width, valueToY(v, height)]);
}

// Uniform Catmull-Rom through the same data points, converted to cubic
// beziers — a continuous signal, not a stock-ticker zigzag.
function smoothPath(points: [number, number][]): string {
  if (points.length < 3) return `M${points.map((p) => p.join(",")).join("L")}`;
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

// Linear-interpolated read of the trace at a 0–1 position — what the corner
// readout displays as the beam sweeps across it.
function sampleAt(progress: number): number {
  const idx = progress * (HERO_WAVE.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, HERO_WAVE.length - 1);
  const t = idx - i0;
  return HERO_WAVE[i0] * (1 - t) + HERO_WAVE[i1] * t;
}

const WPM_TICKS = [HERO_MIN, Math.round((HERO_MIN + HERO_MAX) / 2 / 10) * 10, HERO_MAX];
const TIME_TICKS = ["0s", "1s", "2s", "3s"];

// Fixed channel colors — an oscilloscope's CH1/CH2/CH3 trace colors don't
// change with the scope's cosmetic theme, and neither do these. CH1 matches
// the hero trace and the app's primary accent; CH2/CH3 are its companions.
const CH1 = "#34d1c4";
const CH2 = "#f2b84b";
const CH3 = "#c78fff";

const READOUTS: { ch: string; label: string; name: string; copy: string; icon: LucideIcon; color: string }[] = [
  {
    ch: "CH1",
    label: "WPM",
    name: "frequency",
    copy: "How fast the signal repeats — net words per minute, backspace-corrected.",
    icon: Gauge,
    color: CH1,
  },
  {
    ch: "CH2",
    label: "ACCURACY",
    name: "signal clarity",
    copy: "How much of what you typed matches the source, keystroke for keystroke.",
    icon: Target,
    color: CH2,
  },
  {
    ch: "CH3",
    label: "CONSISTENCY",
    name: "phase stability",
    copy: "How steady your pace holds across the run — low jitter, not just a high peak.",
    icon: Activity,
    color: CH3,
  },
];

// Illustrative meter reads for the channel bank — authored to look like a
// healthy run, same as the hero trace. Not live data.
const METER_READS = [82, 97, 88];

const MODES: { key: string; label: string; copy: string; icon: LucideIcon }[] = [
  { key: "time", label: "TIME", copy: "Race the clock — 15 to 120s.", icon: Timer },
  { key: "words", label: "WORDS", copy: "Fixed word count, 10 to 100.", icon: Type },
  { key: "quote", label: "QUOTE", copy: "One real passage, start to finish.", icon: Quote },
  { key: "zen", label: "ZEN", copy: "No limit. Stop whenever.", icon: Leaf },
];

// Thin connective trace between sections — deliberate dead space, not
// leftover gap. Keeps the page reading as one signal path top to bottom.
function Wire() {
  return (
    <div
      aria-hidden="true"
      className="w-px h-10 sm:h-12 mx-auto bg-gradient-to-b from-transparent via-sub/50 to-transparent"
    />
  );
}

export default function LandingPage() {
  const { theme, setTheme } = useSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const beamRef = useRef<SVGCircleElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const points = heroPoints(HERO_W, HERO_H);
  const d = smoothPath(points);

  useGSAP(
    () => {
      const path = pathRef.current;
      const beam = beamRef.current;
      const clipRect = clipRectRef.current;
      if (!path || !clipRect) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const updateReadout = () => {
        if (readoutRef.current) readoutRef.current.textContent = String(Math.round(sampleAt(0)));
      };

      if (reduced) {
        gsap.set(clipRect, { attr: { width: HERO_W } });
        gsap.set(".hero-line, .hero-cta", { opacity: 1, y: 0, scale: 1 });
        if (beam) {
          const end = path.getPointAtLength(path.getTotalLength());
          gsap.set(beam, { opacity: 1, attr: { cx: end.x, cy: end.y } });
        }
        if (readoutRef.current) readoutRef.current.textContent = String(HERO_WAVE[HERO_WAVE.length - 1]);
      } else {
        gsap.set(clipRect, { attr: { width: 0 } });
        if (beam) gsap.set(beam, { opacity: 0 });
        updateReadout();

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.to(clipRect, { attr: { width: HERO_W }, duration: 1.3, ease: "power1.inOut" })
          .to(beam, { opacity: 1, duration: 0.2 }, "<")
          .from(".hero-line", { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=1")
          .from(".hero-cta", { y: 10, opacity: 0, duration: 0.5 }, "-=0.3");

        if (beam) {
          // The beam sweeps the trace on load, then keeps a slow idle
          // loop — the one orchestrated moment in the hero, reading its
          // own signal live rather than sitting on a finished drawing.
          gsap.to(beam, {
            motionPath: { path, autoRotate: false },
            duration: 3.2,
            repeat: -1,
            ease: "none",
            delay: 1.3,
            onUpdate: function () {
              if (readoutRef.current) {
                readoutRef.current.textContent = String(Math.round(sampleAt(this.progress())));
              }
            },
          });
        }

        gsap.utils.toArray<HTMLElement>(".reveal-panel").forEach((el) => {
          gsap.from(el, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="flex flex-col w-full">
      {/* Console layout: readings on the right like an instrument's own
          screen, controls (headline, copy, CTA) on the left — not a
          centered poster stacked above a chart. Mobile keeps the trace
          first since there's no side-by-side room to earn. */}
      <section className="flex flex-col lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-center gap-10 lg:gap-12 max-w-6xl mx-auto w-full pt-6 sm:pt-8 pb-16 sm:pb-20 px-4">
        <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start gap-5 text-center lg:text-left">
          <div className="hero-line flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-main animate-pulse" style={{ boxShadow: "0 0 6px var(--main)" }} aria-hidden="true" />
            <span className="font-test text-[10px] tracking-[0.3em] uppercase text-sub">live signal</span>
          </div>

          <h1 className="hero-line font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[0.95]">
            Your typing has a <span className="text-main">waveform.</span>
          </h1>
          <p className="hero-line text-text/75 text-sm sm:text-base tracking-wide max-w-md">
            typerush traces every run live — speed, accuracy, and consistency read like signal off
            a scope, not a scoreboard.
          </p>

          <TriggerButton href="/type" className="hero-cta mt-1">
            Start typing test
          </TriggerButton>
        </div>

        <Panel className="order-1 lg:order-2 relative w-full px-4 py-6 sm:px-8 sm:py-8">
          <span className="font-test absolute top-3 right-4 sm:right-6 text-[10px] tracking-[0.1em] text-sub tabular-nums">
            <span ref={readoutRef}>0</span> WPM
          </span>

          <svg viewBox={`0 0 ${HERO_W} ${HERO_H}`} className="w-full" style={{ height: 160 }} aria-hidden="true">
            <defs>
              <filter id="hero-glow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <clipPath id="hero-reveal">
                <rect ref={clipRectRef} x={0} y={-8} width={0} height={HERO_H + 16} />
              </clipPath>
            </defs>

            <line
              x1={0}
              y1={HERO_H / 2}
              x2={HERO_W}
              y2={HERO_H / 2}
              stroke="var(--sub)"
              strokeOpacity="0.25"
              strokeWidth="1"
              strokeDasharray="1 4"
            />

            {/* left axis: wpm ticks */}
            {WPM_TICKS.map((v) => (
              <g key={v} className="font-test">
                <line x1={0} y1={valueToY(v, HERO_H)} x2={6} y2={valueToY(v, HERO_H)} stroke="var(--sub)" strokeOpacity="0.4" strokeWidth="1" />
                <text x={9} y={valueToY(v, HERO_H) + 3} fontSize="7" fill="var(--sub)" opacity="0.6">
                  {v}
                </text>
              </g>
            ))}
            {/* bottom axis: time ticks */}
            {TIME_TICKS.map((label, i) => {
              const x = (i / (TIME_TICKS.length - 1)) * HERO_W;
              return (
                <text key={label} x={x} y={HERO_H - 2} fontSize="7" fill="var(--sub)" opacity="0.5" textAnchor={i === 0 ? "start" : i === TIME_TICKS.length - 1 ? "end" : "middle"} className="font-test">
                  {label}
                </text>
              );
            })}

            <g clipPath="url(#hero-reveal)">
              <path ref={glowRef} d={d} fill="none" stroke="var(--main)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" filter="url(#hero-glow)" vectorEffect="non-scaling-stroke" />
              <path ref={pathRef} d={d} fill="none" stroke="var(--main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </g>

            <circle ref={beamRef} cx={points[0][0]} cy={points[0][1]} r="4" fill="var(--main)" style={{ filter: "drop-shadow(0 0 4px var(--main))" }} />
          </svg>
        </Panel>
      </section>

      <Wire />

      {/* Channel bank: one continuous instrument panel, three rows — the
          same row rhythm as a history/leaderboard readout, not a trio of
          icon-and-paragraph cards. Each row is a channel, not a feature. */}
      <section className="flex flex-col gap-4 max-w-3xl mx-auto w-full px-4 py-10">
        <SectionLabel>signal channels</SectionLabel>
        <Panel className="reveal-panel font-test flex flex-col">
          {READOUTS.map((r, i) => (
            <div
              key={r.ch}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 px-5 py-4 border-b border-sub/15 last:border-b-0"
            >
              <div className="flex items-center gap-3 sm:w-40 shrink-0">
                <r.icon size={16} style={{ color: r.color }} aria-hidden="true" />
                <div>
                  <div className="text-[10px] tracking-[0.15em]" style={{ color: r.color }}>
                    {r.ch}
                  </div>
                  <div className="text-text text-sm tracking-[0.03em] uppercase">{r.label}</div>
                </div>
              </div>
              <p className="flex-1 text-sub text-xs sm:text-sm leading-snug min-w-0">{r.copy}</p>
              <div className="w-full sm:w-28 shrink-0">
                <SignalBar value={METER_READS[i]} max={100} color={r.color} />
              </div>
            </div>
          ))}
        </Panel>
      </section>

      <Wire />

      <section className="flex flex-col gap-4 max-w-3xl mx-auto w-full px-4 py-10">
        <SectionLabel>select input</SectionLabel>
        {/* A single bordered selector strip, not four repeated bracket cards
            — this is a switch, not another readout. */}
        <div className="reveal-panel font-test flex flex-col sm:flex-row border border-sub/25">
          {MODES.map((m) => (
            <Link
              key={m.key}
              href="/type"
              className="group flex-1 flex flex-col items-center gap-1.5 px-4 py-5 border-t sm:border-t-0 sm:border-l first:border-t-0 first:sm:border-l-0 border-sub/25 text-sub transition-colors hover:text-main hover:bg-sub-alt"
            >
              <m.icon size={16} className="transition-colors" aria-hidden="true" />
              <span className="text-xs tracking-[0.15em] uppercase text-text group-hover:text-main transition-colors">
                {m.label}
              </span>
              <span className="text-[11px] text-sub text-center leading-snug">{m.copy}</span>
            </Link>
          ))}
        </div>
      </section>

      <Wire />

      <section className="flex flex-col items-center gap-6 max-w-lg mx-auto w-full px-4 py-10 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-sub">twenty color themes — pick one</p>
        <div className="reveal-panel grid grid-cols-5 gap-x-4 gap-y-5">
          {THEMES.map((t) => {
            const selected = theme === t;
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="flex flex-col items-center gap-2 group"
                aria-pressed={selected}
              >
                <span
                  className="relative flex items-center justify-center w-5 h-5 rounded-full transition-transform group-hover:scale-110"
                  style={{
                    background: THEME_ACCENT[t],
                    boxShadow: selected ? `0 0 0 2px var(--bg), 0 0 0 4px ${THEME_ACCENT[t]}, 0 0 10px ${THEME_ACCENT[t]}` : `0 0 6px ${THEME_ACCENT[t]}`,
                  }}
                >
                  {selected && <Check size={11} className="text-bg" strokeWidth={3} aria-hidden="true" />}
                </span>
                <span
                  className={`text-[10px] tracking-[0.1em] uppercase transition-colors ${
                    selected ? "text-text" : "text-sub group-hover:text-text"
                  }`}
                >
                  {t}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sub text-xs max-w-sm">
          switch anytime from account settings — the whole panel changes with it, not just the accent.
        </p>
      </section>

      <Wire />

      {/* Bookend: the hero opened on a live, moving trace. This closes on
          a flat one — no signal until you actually start. */}
      <section className="flex flex-col items-center gap-6 py-16 px-4 text-center border-t border-sub/15">
        <div className="w-full max-w-[220px] opacity-50">
          <Oscilloscope samples={[0]} height={28} strokeWidth={1} />
        </div>
        <p className="font-test text-[10px] tracking-[0.3em] uppercase text-sub -mt-2">no signal yet</p>
        <h2 className="font-display text-4xl sm:text-5xl text-text font-bold tracking-tight">Start your trace.</h2>
        <TriggerButton href="/type">start test</TriggerButton>
      </section>
    </div>
  );
}
