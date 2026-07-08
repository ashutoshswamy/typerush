import type { ThemeName } from "@/store/settings";

export const THEMES: ThemeName[] = [
  "signal",
  "dracula",
  "nord",
  "monokai",
  "solar",
  "gruvbox",
  "tokyo",
  "everforest",
  "catppuccin",
  "rosepine",
  "onedark",
  "material",
  "ayu",
  "nightowl",
  "synthwave",
  "cobalt",
  "palenight",
  "horizon",
  "kanagawa",
  "github",
];

// Mirrors the --main value of each [data-theme] block in globals.css, so a
// swatch can preview the accent without switching themes to see it.
export const THEME_ACCENT: Record<ThemeName, string> = {
  signal: "#34d1c4",
  dracula: "#ff79c6",
  nord: "#88c0d0",
  monokai: "#a6e22e",
  solar: "#b58900",
  gruvbox: "#d79921",
  tokyo: "#7aa2f7",
  everforest: "#a7c080",
  catppuccin: "#cba6f7",
  rosepine: "#ebbcba",
  onedark: "#61afef",
  material: "#82aaff",
  ayu: "#ffb454",
  nightowl: "#7fdbca",
  synthwave: "#ff7edb",
  cobalt: "#ffc600",
  palenight: "#c792ea",
  horizon: "#e95678",
  kanagawa: "#7e9cd8",
  github: "#58a6ff",
};
