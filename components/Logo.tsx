import Link from "next/link";

// One logo, everywhere. Colors come from the active theme's CSS variables,
// so the mark re-tints the moment the theme changes. Static copies of the
// same mark live in app/icon.svg and public/ (favicons, app icons).
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="16" fill="var(--main)" />
      <g fill="none" stroke="var(--bg)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 15V40Q23 48 31 48" />
        <path d="M15 26H32" />
        <path d="M41 26V48" />
        <path d="M41 36Q41 26 51 26" />
      </g>
    </svg>
  );
}

export function Logo({ size = 32, textClassName = "text-xl" }: { size?: number; textClassName?: string }) {
  return (
    <Link href="/" aria-label="typerush home" className="flex shrink-0 items-center gap-2.5">
      <LogoMark size={size} />
      <span className={`font-display font-extrabold tracking-tight text-text ${textClassName}`}>typerush</span>
    </Link>
  );
}
