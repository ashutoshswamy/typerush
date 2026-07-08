"use client";

import { Palette, TextCursorInput, Volume2, EyeOff } from "lucide-react";
import { useSettings, type CaretStyle } from "@/store/settings";
import { Panel } from "./Panel";
import { THEMES, THEME_ACCENT } from "@/lib/themes";

const CARET_STYLES: CaretStyle[] = ["line", "block", "underline"];

export function SettingsPanel() {
  const {
    theme,
    setTheme,
    caretStyle,
    setCaretStyle,
    soundOnClick,
    toggleSound,
    blindMode,
    toggleBlindMode,
  } = useSettings();

  return (
    <Panel className="flex flex-col gap-6 max-w-md text-xs tracking-[0.1em] uppercase px-6 py-5">
      <div>
        <div className="flex items-center gap-1.5 text-sub mb-2">
          <Palette size={14} aria-hidden="true" />
          theme
        </div>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center gap-2 px-3 py-1 border transition-colors ${
                theme === t ? "border-main text-main" : "border-sub/30 text-sub hover:text-text"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: THEME_ACCENT[t] }}
                aria-hidden="true"
              />
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-sub mb-2">
          <TextCursorInput size={14} aria-hidden="true" />
          caret style
        </div>
        <div className="flex gap-3">
          {CARET_STYLES.map((c) => (
            <button
              key={c}
              onClick={() => setCaretStyle(c)}
              className={`px-3 py-1 border transition-colors ${
                caretStyle === c ? "border-main text-main" : "border-sub/30 text-sub hover:text-text"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sub">
        <input type="checkbox" checked={soundOnClick} onChange={toggleSound} className="accent-[var(--main)]" />
        <Volume2 size={14} aria-hidden="true" />
        sound on click
      </label>
      <label className="flex items-center gap-2 cursor-pointer text-sub">
        <input type="checkbox" checked={blindMode} onChange={toggleBlindMode} className="accent-[var(--main)]" />
        <EyeOff size={14} aria-hidden="true" />
        blind mode (hide errors)
      </label>
    </Panel>
  );
}
