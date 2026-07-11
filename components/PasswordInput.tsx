"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  value,
  onChange,
  placeholder,
  minLength,
  autoFocus,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
  autoFocus?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        className="w-full bg-sub-alt border border-sub/30 px-3 py-2 pr-9 text-sm outline-none focus:border-main"
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={minLength}
        autoFocus={autoFocus}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-2.5 text-sub hover:text-text transition-colors"
        aria-label={visible ? "hide password" : "show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
      </button>
    </div>
  );
}
