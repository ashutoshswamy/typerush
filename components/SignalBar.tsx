// dB-meter style magnitude bar — used wherever a wpm value needs a scannable
// visual weight next to the number (leaderboard rows, PB tiles). Optional
// color lets a multi-channel readout give each row its own signal color.
export function SignalBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <span className="relative block h-1 w-full bg-sub/15 overflow-hidden">
      <span
        className={`absolute inset-y-0 left-0 ${color ? "" : "bg-main/70"}`}
        style={{ width: `${pct}%`, background: color ? color : undefined }}
      />
    </span>
  );
}
