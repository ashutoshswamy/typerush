// Section plate: dot + label + graticule rule filling the rest of the row —
// same channel-strip language as the NavBar's bottom graticule and its
// pulsing logo dot, reused wherever a page needs to read as a rack of
// live instruments rather than stacked cards.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="w-1.5 h-1.5 rounded-full bg-main shrink-0" style={{ boxShadow: "0 0 5px var(--main)" }} aria-hidden="true" />
      <h2 className="font-test text-sub text-xs tracking-[0.15em] uppercase shrink-0">{children}</h2>
      <span className="graticule flex-1" aria-hidden="true" />
    </div>
  );
}
