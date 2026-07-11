import { xpProgress } from "@/lib/xp";

// Compact level readout — a filled tick under the level number, same
// instrument-gauge language as the rest of the account plate.
export function LevelBadge({ xp, size = "md" }: { xp: number; size?: "sm" | "md" }) {
  const { level, into, need } = xpProgress(xp);
  const pct = need > 0 ? Math.min(100, Math.round((into / need) * 100)) : 100;
  const big = size === "md";

  return (
    <div className={`flex flex-col gap-1 ${big ? "min-w-[7rem]" : "min-w-[5rem]"}`}>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display text-main font-bold leading-none ${big ? "text-2xl" : "text-base"}`}>
          lv {level}
        </span>
        <span className="font-test text-sub text-[10px] tracking-[0.1em] uppercase tabular-nums">
          {into}/{need} xp
        </span>
      </div>
      <div className="h-1 w-full bg-sub-alt overflow-hidden rounded-full">
        <div
          className="h-full bg-main transition-[width] duration-500"
          style={{ width: `${pct}%`, boxShadow: "0 0 4px var(--main)" }}
        />
      </div>
    </div>
  );
}
