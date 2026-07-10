"use client";

import { motion } from "framer-motion";
import { Palette, TextCursorInput, Volume2, EyeOff } from "lucide-react";
import { useSettings, type CaretStyle } from "@/store/settings";
import { Panel } from "./Panel";
import { Checkbox } from "./Checkbox";
import { DARK_THEMES, LIGHT_THEMES, THEME_ACCENT } from "@/lib/themes";

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
    <Panel className="flex flex-col gap-6 text-xs tracking-[0.1em] uppercase px-6 py-5">
      <div>
        <div className="flex items-center gap-1.5 text-sub mb-2">
          <Palette size={14} aria-hidden="true" />
          theme
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-sub/60 mb-1.5 normal-case text-[10px] tracking-normal">dark</div>
            <div className="flex flex-wrap gap-3">
              {DARK_THEMES.map((t) => (
                <motion.button
                  key={t}
                  onClick={() => setTheme(t)}
                  whileTap={{ scale: 0.95 }}
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
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sub/60 mb-1.5 normal-case text-[10px] tracking-normal">light</div>
            <div className="flex flex-wrap gap-3">
              {LIGHT_THEMES.map((t) => (
                <motion.button
                  key={t}
                  onClick={() => setTheme(t)}
                  whileTap={{ scale: 0.95 }}
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
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-sub mb-2">
          <TextCursorInput size={14} aria-hidden="true" />
          caret style
        </div>
        <div className="flex gap-3">
          {CARET_STYLES.map((c) => (
            <motion.button
              key={c}
              onClick={() => setCaretStyle(c)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 border transition-colors ${
                caretStyle === c ? "border-main text-main" : "border-sub/30 text-sub hover:text-text"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sub">
        <Checkbox checked={soundOnClick} onChange={toggleSound} />
        <Volume2 size={14} aria-hidden="true" />
        sound on click
      </label>
      <label className="flex items-center gap-2 cursor-pointer text-sub">
        <Checkbox checked={blindMode} onChange={toggleBlindMode} />
        <EyeOff size={14} aria-hidden="true" />
        blind mode (hide errors)
      </label>
    </Panel>
  );
}
