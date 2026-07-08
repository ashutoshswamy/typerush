import Link from "next/link";
import { ChevronRight } from "lucide-react";

// The instrument-panel CTA: a power/trigger switch, not a filled pill.
// Used for every "start the test" call in the app.
export function TriggerButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center gap-3 border-2 border-main px-7 py-3.5 font-test text-xs font-medium tracking-[0.25em] uppercase text-main transition-colors hover:bg-main hover:text-bg ${className}`}
    >
      <span className="w-2 h-2 bg-main transition-colors group-hover:bg-bg" aria-hidden="true" />
      {children}
      <ChevronRight size={14} aria-hidden="true" />
    </Link>
  );
}
