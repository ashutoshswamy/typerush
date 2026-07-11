"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiKofi } from "react-icons/si";
import { fadeIn } from "@/lib/motion";
import { useSettings } from "@/store/settings";
import { DARK_THEMES, LIGHT_THEMES } from "@/lib/themes";

const DEV_LINKS = [
  { label: "GitHub", href: "https://github.com/ashutoshswamy", icon: FaGithub },
  { label: "LinkedIn", href: "https://linkedin.com/in/ashutoshswamy", icon: FaLinkedin },
  { label: "X", href: "https://x.com/ashutoshswamy_", icon: FaXTwitter },
  { label: "Ko-fi", href: "https://ko-fi.com/ashutoshswamy", icon: SiKofi },
];

const SITE_LINKS = [
  { label: "type test", href: "/type" },
  { label: "leaderboard", href: "/leaderboard" },
  { label: "account", href: "/account" },
];

const LEGAL_LINKS = [
  { label: "terms of service", href: "/terms" },
  { label: "privacy policy", href: "/privacy" },
];

export function Footer() {
  const pathname = usePathname();
  const { theme, setTheme } = useSettings();
  if (pathname === "/type") return null;

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeIn}
      className="relative z-10 mt-auto"
    >
      <span className="graticule w-full block" aria-hidden="true" />

      <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-[1.3fr_1fr_1fr_1fr] gap-x-8 gap-y-10">
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 font-display text-main font-bold tracking-[0.1em] text-base">
            <span
              className="w-1.5 h-1.5 rounded-full bg-main"
              style={{ boxShadow: "0 0 6px var(--main)" }}
              aria-hidden="true"
            />
            typerush
          </div>
          <p className="text-sub text-xs leading-relaxed max-w-[26ch]">
            A typing test that reads speed, accuracy, and consistency like signal off a scope.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-test text-sub text-[10px] tracking-[0.2em] uppercase">navigate</h2>
          <nav className="flex flex-col gap-2">
            {SITE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-text/80 hover:text-main transition-colors text-sm w-fit">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-test text-sub text-[10px] tracking-[0.2em] uppercase">connect</h2>
          <div className="flex flex-col gap-2">
            {DEV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text/80 hover:text-main transition-colors text-sm w-fit"
              >
                <l.icon size={13} aria-hidden="true" />
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-test text-sub text-[10px] tracking-[0.2em] uppercase">legal</h2>
          <nav className="flex flex-col gap-2">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-text/80 hover:text-main transition-colors text-sm w-fit">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-sub/15">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-test text-[10px] tracking-[0.1em] text-sub/60" suppressHydrationWarning>
            © {new Date().getFullYear()} ashutoshswamy. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="footer-theme" className="font-test text-[10px] tracking-[0.1em] text-sub/60">
              theme
            </label>
            <select
              id="footer-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as (typeof DARK_THEMES)[number])}
              className="bg-transparent border border-sub/30 text-sub hover:text-main focus:text-main focus:border-main transition-colors font-test text-[10px] tracking-[0.1em] px-2 py-1 outline-none capitalize"
            >
              <optgroup label="dark">
                {DARK_THEMES.map((t) => (
                  <option key={t} value={t} className="bg-bg text-text">
                    {t}
                  </option>
                ))}
              </optgroup>
              <optgroup label="light">
                {LIGHT_THEMES.map((t) => (
                  <option key={t} value={t} className="bg-bg text-text">
                    {t}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <p className="font-test text-[10px] tracking-[0.1em] text-sub/60">built by ashutoshswamy</p>
        </div>
      </div>
    </motion.footer>
  );
}
