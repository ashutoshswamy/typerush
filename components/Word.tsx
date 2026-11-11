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
  line: "w-0 border-l-2 border-caret",
  block: "w-full bg-caret/40 rounded-sm",
  underline: "w-full border-b-2 border-caret",
};

// DM Sans is proportional, so the caret can't be positioned in `ch`: it is
// rendered inside the character it sits before (or after the last one).
function Caret({ style, end }: { style: WordProps["caretStyle"]; end?: boolean }) {
  return (
    <span
      className={`absolute inset-y-0 pointer-events-none animate-pulse ${end ? "right-0" : "left-0"} ${caretClass[style]}`}
      aria-hidden="true"
    />
  );
}

function WordImpl({ target, typed, isCurrent, isDone, blindMode, caretStyle }: WordProps) {
  const chars = target.split("");
  const extra = typed.length > target.length ? typed.slice(target.length) : "";
  const caretAt = typed.length;

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
        return (
          <span key={i} className={`relative ${cls}`}>
            {ch}
            {isCurrent && caretAt === i && <Caret style={caretStyle} />}
          </span>
        );
      })}
      {extra && !blindMode && (
        <span className="relative text-error-extra">
          {extra}
          {isCurrent && <Caret style={caretStyle} end />}
        </span>
      )}
      {isCurrent && !extra && caretAt >= chars.length && (
        <span className="relative w-[0.5ch]">
          <Caret style={caretStyle} />
        </span>
      )}
    </span>
  );
}

export const Word = memo(WordImpl);
