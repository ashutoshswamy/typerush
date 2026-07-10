// dB-meter style magnitude bar — used wherever a wpm value needs a scannable
// visual weight next to the number (leaderboard rows, PB tiles). Optional
// color lets a multi-channel readout give each row its own signal color.
// `graduated` adds VU-meter tick marks for a denser instrument reading —
// used where the bar is the main visual, not a small inline accent.
export function SignalBar({
  value,
  max,
  color,
  graduated,
}: {
  value: number;
  max: number;
  color?: string;
  graduated?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <span className={`relative block w-full bg-sub/15 overflow-hidden ${graduated ? "h-2.5" : "h-1"}`}>
      <span
        className={`absolute inset-y-0 left-0 ${color ? "" : "bg-main/70"}`}
        style={{ width: `${pct}%`, background: color ? color : undefined }}
      />
      {graduated && (
        <span
          className="absolute inset-0 bg-[repeating-linear-gradient(to_right,var(--bg)_0,var(--bg)_1px,transparent_1px,transparent_7px)]"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
