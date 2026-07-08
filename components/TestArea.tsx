"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEngine } from "@/store/engine";
import { useSettings } from "@/store/settings";
import { Word } from "./Word";
import { Oscilloscope } from "./Oscilloscope";
import { playClickSound } from "@/lib/sound";

const LINES_VISIBLE = 3;

export function TestArea() {
  const {
    words,
    typed,
    wordIndex,
    status,
    config,
    mode,
    elapsedMs,
    wpmTimeline,
    tick,
    type,
    backspace,
  } = useEngine();
  const { blindMode, caretStyle, soundOnClick } = useSettings();

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [lineOffset, setLineOffset] = useState(0);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // performance.now()-driven tick loop, not naive setInterval counting.
  useEffect(() => {
    if (status !== "running") return;
    let raf: number;
    let lastTick = performance.now();
    const loop = () => {
      const now = performance.now();
      if (now - lastTick >= 250) {
        lastTick = now;
        tick();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, tick]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const active = activeWordRef.current;
    if (!container || !active) return;
    const lineHeight = active.offsetHeight;
    const activeTop = active.offsetTop;
    const currentLine = Math.round((activeTop - lineOffset) / lineHeight);
    if (currentLine >= 1) {
      setLineOffset(lineOffset + lineHeight);
    }
  }, [wordIndex, lineOffset]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Tab") {
        e.preventDefault();
        useEngine.getState().restart();
        setLineOffset(0);
        return;
      }
      if (status === "finished") return;
      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        if (soundOnClick) playClickSound();
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        type(" ");
        if (soundOnClick) playClickSound();
        return;
      }
      if (e.key.length === 1) {
        type(e.key);
        if (soundOnClick) playClickSound();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, type, backspace, soundOnClick]);

  const elapsedSeconds = elapsedMs / 1000;
  const timeLeft = mode === "time" ? Math.max(0, Math.ceil((config.duration ?? 0) - elapsedSeconds)) : null;
  const wordsLeft = mode === "words" ? Math.max(0, (config.wordCount ?? 0) - wordIndex) : null;

  return (
    <div className="font-test flex flex-col items-center gap-8 w-full max-w-3xl mx-auto">
      <div className="flex flex-col items-center gap-1 h-14">
        <div className="text-3xl text-main tabular-nums font-medium">
          {status !== "idle" ? (timeLeft !== null ? timeLeft : wordsLeft !== null ? wordsLeft : "") : " "}
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-sub h-3">
          {status !== "idle" ? (mode === "time" ? "sec remaining" : mode === "words" ? "words left" : "") : ""}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden text-2xl leading-relaxed select-none w-full"
        style={{ height: `${LINES_VISIBLE * 2.25}rem` }}
      >
        <div
          ref={innerRef}
          className="flex flex-wrap gap-x-3 gap-y-2 transition-transform duration-150"
          style={{ transform: `translateY(-${lineOffset}px)` }}
        >
          {words.map((w, i) => (
            <span key={i} ref={i === wordIndex ? activeWordRef : undefined}>
              <Word
                target={w}
                typed={typed[i] ?? ""}
                isCurrent={i === wordIndex}
                isDone={i < wordIndex}
                blindMode={blindMode}
                caretStyle={caretStyle}
              />
            </span>
          ))}
        </div>
      </div>

      <div
        className={`w-full flex flex-col items-center gap-3 transition-opacity duration-300 ${
          status === "running" ? "opacity-40" : "opacity-100"
        }`}
      >
        <span className="graticule w-full" />
        <Oscilloscope samples={wpmTimeline} height={40} />
      </div>

      <p className="text-sub text-xs tracking-[0.2em] uppercase">tab — restart</p>
    </div>
  );
}
