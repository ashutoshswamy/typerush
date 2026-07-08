import { memo } from "react";

interface WordProps {
  target: string;
  typed: string;
  isCurrent: boolean;
  isDone: boolean;
  blindMode: boolean;
  caretStyle: "line" | "block" | "underline";
}

const caretClass: Record<WordProps["caretStyle"], string> = {
  line: "border-l-2 border-caret",
  block: "bg-caret/60 w-[0.6ch]",
  underline: "border-b-2 border-caret w-[0.6ch]",
};

function WordImpl({ target, typed, isCurrent, isDone, blindMode, caretStyle }: WordProps) {
  const chars = target.split("");
  const extra = typed.length > target.length ? typed.slice(target.length) : "";

  return (
    <span
      className={`relative inline-flex ${
        isDone && typed !== target && !blindMode ? "underline decoration-error decoration-2 underline-offset-4" : ""
      }`}
    >
      {chars.map((ch, i) => {
        const typedCh = typed[i];
        let cls = "text-sub"; // untyped
        if (typedCh !== undefined) {
          const correct = typedCh === ch;
          cls = correct || blindMode ? "text-text" : "text-error";
        }
        return <span key={i} className={cls}>{ch}</span>;
      })}
      {extra && !blindMode && <span className="text-error-extra">{extra}</span>}

      {/* One persistent caret per word — always mounted so its `left`
          transition can animate between character positions instead of
          teleporting. Built in, not a "smooth caret" toggle. */}
      <span
        className={`absolute inset-y-0 pointer-events-none transition-all duration-100 ease-out ${
          caretClass[caretStyle]
        } ${isCurrent ? "opacity-100" : "opacity-0"}`}
        style={{ left: `${typed.length}ch` }}
      />
    </span>
  );
}

export const Word = memo(WordImpl);
