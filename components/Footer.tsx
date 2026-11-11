"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Globe } from "lucide-react";
import { EASE } from "@/lib/motion";
import { Logo } from "./Logo";
import { useSettings } from "@/store/settings";
import { DARK_THEMES, LIGHT_THEMES } from "@/lib/themes";

const DEV_LINKS = [
  { label: "GitHub", href: "https://github.com/ashutoshswamy", icon: FaGithub },
  { label: "LinkedIn", href: "https://linkedin.com/in/ashutoshswamy", icon: FaLinkedin },
  { label: "X", href: "https://x.com/ashutoshswamy_", icon: FaXTwitter },
  { label: "Portfolio", href: "https://ashutoshswamy.in", icon: Globe },
];

const LINK_GROUPS = [
  {
    title: "Play",
    links: [
      { label: "Type test", href: "/type" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Account", href: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { theme, setTheme } = useSettings();
  if (pathname === "/type") return null;

  return (
    <motion.footer
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative z-10 mt-auto px-3 pb-3 sm:px-5 sm:pb-5"
    >
      <div className="surface relative mx-auto max-w-6xl">
        <div className="relative z-10 grid gap-12 px-6 pt-10 pb-8 sm:px-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <div>
              <Logo size={40} textClassName="text-3xl" />
              <p className="mt-4 max-w-xs leading-relaxed text-text/65">
                A calm, fast typing test. Race friends, climb the leaderboard, level up.
              </p>
            </div>
            <div className="flex gap-2">
              {DEV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-sub/30 text-text/65 transition-[color,border-color,transform] hover:-translate-y-0.5 hover:border-main hover:text-main"
                >
                  <l.icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:max-w-md lg:justify-self-end lg:w-full">
            {LINK_GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3.5">
                <h2 className="font-display text-base font-bold text-text">{group.title}</h2>
                {group.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="w-fit text-text/65 transition-colors hover:text-main"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-6 flex flex-col items-center justify-between gap-4 border-t border-sub/15 py-5 text-sm text-text/65 sm:mx-10 sm:flex-row">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} typerush. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <label htmlFor="footer-theme">Theme</label>
            <select
              id="footer-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as (typeof DARK_THEMES)[number])}
              className="cursor-pointer rounded-full border border-sub/30 bg-transparent px-3.5 py-1.5 capitalize text-text outline-none transition-colors hover:border-main focus:border-main"
            >
              <optgroup label="Dark">
                {DARK_THEMES.map((t) => (
                  <option key={t} value={t} className="bg-bg text-text">
                    {t}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Light">
                {LIGHT_THEMES.map((t) => (
                  <option key={t} value={t} className="bg-bg text-text">
                    {t}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

      </div>
    </motion.footer>
  );
}
