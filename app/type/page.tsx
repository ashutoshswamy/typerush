"use client";

import { useEngine } from "@/store/engine";
import { ConfigBar } from "@/components/ConfigBar";
import { TestArea } from "@/components/TestArea";
import { Results } from "@/components/Results";

export default function Home() {
  const status = useEngine((s) => s.status);

  return (
    <div className="flex flex-col items-center gap-10 py-10">
      {/* Visually hidden — the test screen stays near-empty by design
          (see CLAUDE.md), but the page still needs a real h1 for a11y/SEO. */}
      <h1 className="sr-only">Typing Speed Test</h1>
      {status !== "finished" && <ConfigBar />}
      {status !== "finished" ? <TestArea /> : <Results />}
    </div>
  );
}
