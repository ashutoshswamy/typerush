import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName =
  | "signal"
  | "dracula"
  | "nord"
  | "monokai"
  | "solar"
  | "gruvbox"
  | "tokyo"
  | "everforest"
  | "catppuccin"
  | "rosepine"
  | "onedark"
  | "material"
  | "ayu"
  | "nightowl"
  | "synthwave"
  | "cobalt"
  | "palenight"
  | "horizon"
  | "kanagawa"
  | "github";
export type CaretStyle = "line" | "block" | "underline";

interface SettingsState {
  theme: ThemeName;
  caretStyle: CaretStyle;
  soundOnClick: boolean;
  blindMode: boolean;
  font: string;
  setTheme: (t: ThemeName) => void;
  setCaretStyle: (c: CaretStyle) => void;
  toggleSound: () => void;
  toggleBlindMode: () => void;
  setFont: (f: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "signal",
      caretStyle: "line",
      soundOnClick: false,
      blindMode: false,
      font: "var(--font-mono)",
      setTheme: (theme) => set({ theme }),
      setCaretStyle: (caretStyle) => set({ caretStyle }),
      toggleSound: () => set((s) => ({ soundOnClick: !s.soundOnClick })),
      toggleBlindMode: () => set((s) => ({ blindMode: !s.blindMode })),
      setFont: (font) => set({ font }),
    }),
    { name: "typerush-settings" }
  )
);
