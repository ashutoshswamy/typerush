"use client";

import { useEffect, useRef } from "react";
import { animate as tween } from "framer-motion";

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

  const pad = height * 0.067; // proportional padding, was fixed 8px — flattened small (history) charts vs the full-size results chart

  const points =
    samples.length >= 2
      ? samples.map((v, i) => {
          const x = (i / (samples.length - 1)) * width;
          const y = height - (v / max) * (height - pad * 2) - pad;
          return `${x},${y}`;
        })
      : [`0,${height / 2}`, `${width},${height / 2}`];

  // Draw-in: dash the polyline to its own length, then tween the offset to 0.
  useEffect(() => {
    const line = lineRef.current;
    if (!animate || !line) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const length = line.getTotalLength();
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);
    const controls = tween(length, 0, {
      duration: 1.1,
      delay: 0.15,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => {
        line.style.strokeDashoffset = String(v);
      },
      onComplete: () => {
        line.style.strokeDasharray = "";
        line.style.strokeDashoffset = "";
      },
    });
    return () => controls.stop();
  }, [animate, samples.length]);

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
