// The site's instrument bezel — calibration-mark corners, used everywhere a
// block of content reads as a readout rather than a card.
export function Panel({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string; // per-instance corner color, e.g. a channel's own signal color
}) {
  const cornerStyle = accent ? { borderColor: accent, opacity: 0.75 } : undefined;
  return (
    <div className={`relative border border-sub/25 ${className}`}>
      <span className="absolute -top-px -left-px w-2.5 h-2.5 border-l border-t border-main/70" style={cornerStyle} />
      <span className="absolute -top-px -right-px w-2.5 h-2.5 border-r border-t border-main/70" style={cornerStyle} />
      <span className="absolute -bottom-px -left-px w-2.5 h-2.5 border-l border-b border-main/70" style={cornerStyle} />
      <span className="absolute -bottom-px -right-px w-2.5 h-2.5 border-r border-b border-main/70" style={cornerStyle} />
      {children}
    </div>
  );
}
