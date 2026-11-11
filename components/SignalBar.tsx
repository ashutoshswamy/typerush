// Thin rounded magnitude bar for wpm values next to a number.
export function SignalBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color?: string;
  graduated?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-sub/15">
      <span
        className={`absolute inset-y-0 left-0 rounded-full ${color ? "" : "bg-main"}`}
        style={{ width: `${pct}%`, background: color ? color : undefined }}
      />
    </span>
  );
}
