"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Panel } from "@/components/Panel";
import { TriggerButton } from "@/components/TriggerButton";

gsap.registerPlugin(MotionPathPlugin);

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

export default function LandingPage() {
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
      }
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="flex flex-col w-full">
      {/* Single instrument panel, not a stack of sections — the whole page
          is one reading. Bezel row up top (channel + timebase, like a real
          scope's status line) frames the console split below: controls
          left, live trace right. Mobile keeps the trace first since
          there's no side-by-side room to earn. */}
      <section className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full px-4 py-10 sm:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-center gap-10 lg:gap-14">
          <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start gap-5 text-center lg:text-left">
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
        </div>
      </section>
    </div>
  );
}
