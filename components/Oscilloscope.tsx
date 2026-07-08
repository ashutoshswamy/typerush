"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// The app's signature: typing rhythm rendered as a live instrument trace,
// same visual language whether idle, mid-test, or on the results hero.
export function Oscilloscope({
  samples,
  height = 64,
  strokeWidth = 1.5,
  animate = false,
}: {
  samples: number[];
  height?: number;
  strokeWidth?: number;
  animate?: boolean; // draw-in on mount — reserved for the results reveal
}) {
  const width = 100;
  const max = Math.max(...samples, 1);
  const lineRef = useRef<SVGPolylineElement>(null);

  const points =
    samples.length >= 2
      ? samples.map((v, i) => {
          const x = (i / (samples.length - 1)) * width;
          const y = height - (v / max) * (height - 8) - 4;
          return `${x},${y}`;
        })
      : [`0,${height / 2}`, `${width},${height / 2}`];

  useGSAP(
    () => {
      const line = lineRef.current;
      if (!animate || !line) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      const length = line.getTotalLength();
      gsap.fromTo(
        line,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", delay: 0.15 }
      );
    },
    { dependencies: [animate, samples.length] }
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full text-main"
      style={{ height }}
      aria-hidden="true"
    >
      <line
        x1="0"
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="var(--sub)"
        strokeOpacity="0.25"
        strokeWidth="0.5"
        strokeDasharray="0.5 2"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        ref={lineRef}
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
