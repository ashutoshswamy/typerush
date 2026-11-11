"use client";

import { useEffect } from "react";
import { useSettings } from "@/store/settings";

// Same mark as <LogoMark />, re-tinted with the active theme's colors.
function iconHref(accent: string, ink: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${accent}"/>` +
    `<g fill="none" stroke="${ink}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M23 15V40Q23 48 31 48"/><path d="M15 26H32"/><path d="M41 26V48"/><path d="M41 36Q41 26 51 26"/></g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettings((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // Browser tab icon follows the theme too.
    const css = getComputedStyle(root);
    const accent = css.getPropertyValue("--main").trim();
    const ink = css.getPropertyValue("--bg").trim();
    if (!accent || !ink) return;
    document.querySelectorAll('link[rel~="icon"]:not([data-theme-icon])').forEach((el) => el.remove());
    let link = document.querySelector<HTMLLinkElement>("link[data-theme-icon]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.setAttribute("data-theme-icon", "");
      document.head.appendChild(link);
    }
    link.href = iconHref(accent, ink);
  }, [theme]);

  return <>{children}</>;
}
