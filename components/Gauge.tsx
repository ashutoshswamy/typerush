"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const START = -225; // bottom-left, degrees
const SWEEP = 270; // clockwise to bottom-right
const R = 62;
const CX = 84;
const CY = 76;
const VB_W = 168;
const VB_H = 172; // taller than CY+R so the 0/max tick labels never clip

function pointAt(angleDeg: number, radius = R) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(fromDeg: number, toDeg: number, radius = R) {
  const p0 = pointAt(fromDeg, radius);
  const p1 = pointAt(toDeg, radius);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M${p0.x},${p0.y} A${radius},${radius} 0 ${large} 1 ${p1.x},${p1.y}`;
}

// The profile page's signature instrument: peak WPM read off a needle
// sweep rather than a flat number, same speedometer language a typing
// test already invites ("how fast"). Ticks mark quarters of the range;
// the needle and arc fill sweep in once on mount, then sit still.
export function Gauge({ value, max, label = "peak wpm" }: { value: number; max: number; label?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const needleRef = useRef<SVGLineElement>(null);
  const readoutRef = useRef<SVGTextElement>(null);

  const t = max > 0 ? Math.min(1, value / max) : 0;
  const endDeg = START + SWEEP * t;
  const fullPath = arcPath(START, START + SWEEP);
  const ticks = useMemo(() => [0, 0.25, 0.5, 0.75, 1], []);

  useGSAP(
    () => {
      const fill = fillRef.current;
      const needle = needleRef.current;
      if (!fill || !needle) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const length = fill.getTotalLength();

      if (reduced) {
        gsap.set(fill, { strokeDasharray: length, strokeDashoffset: length * (1 - t) });
        gsap.set(needle, { rotation: endDeg - START, transformOrigin: `${CX}px ${CY}px` });
        if (readoutRef.current) readoutRef.current.textContent = String(value);
        return;
      }

      gsap.set(fill, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(needle, { rotation: 0, transformOrigin: `${CX}px ${CY}px` });

      const counter = { v: 0 };
      const tl = gsap.timeline({ delay: 0.2, defaults: { duration: 1.1, ease: "power3.out" } });
      tl.to(fill, { strokeDashoffset: length * (1 - t) }, 0)
        .to(needle, { rotation: endDeg - START }, 0)
        .to(
          counter,
          {
            v: value,
            onUpdate: () => {
              if (readoutRef.current) readoutRef.current.textContent = String(Math.round(counter.v));
            },
          },
          0
        );
    },
    { dependencies: [value, max], scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative shrink-0" style={{ width: VB_W, height: VB_H }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={VB_W} height={VB_H} aria-hidden="true">
        <path d={fullPath} fill="none" stroke="var(--sub)" strokeOpacity="0.25" strokeWidth="6" strokeLinecap="round" />
        <path ref={fillRef} d={fullPath} fill="none" stroke="var(--main)" strokeWidth="6" strokeLinecap="round" />

        {ticks.map((f) => {
          const deg = START + SWEEP * f;
          const outer = pointAt(deg, R + 8);
          const inner = pointAt(deg, R + 2);
          return (
            <line
              key={f}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--sub)"
              strokeOpacity={f === 0 || f === 1 ? 0.6 : 0.35}
              strokeWidth="1.5"
            />
          );
        })}

        <line
          ref={needleRef}
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - (R - 14)}
          stroke="var(--text)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transform: `rotate(${START}deg)`, transformOrigin: `${CX}px ${CY}px` }}
        />
        <circle cx={CX} cy={CY} r="3" fill="var(--text)" />

        <text x={pointAt(START, R + 24).x} y={pointAt(START, R + 24).y} textAnchor="start" fontSize="10" fill="var(--sub)" className="font-test">
          0
        </text>
        <text x={pointAt(START + SWEEP, R + 24).x} y={pointAt(START + SWEEP, R + 24).y} textAnchor="end" fontSize="10" fill="var(--sub)" className="font-test">
          {max}
        </text>

        <text ref={readoutRef} x={CX} y={CY + 30} textAnchor="middle" fontSize="30" fontWeight="700" fill="var(--main)" className="font-display">
          0
        </text>
        <text x={CX} y={CY + 44} textAnchor="middle" fontSize="8" letterSpacing="1.5" fill="var(--sub)" className="font-test uppercase">
          {label}
        </text>
      </svg>
    </div>
  );
}
