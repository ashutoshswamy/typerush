"use client";

import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <span className="relative inline-flex w-3.5 h-3.5 shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer absolute inset-0 opacity-0 cursor-pointer"
      />
      <span
        className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-main peer-focus-visible:outline-offset-2 ${
          checked ? "bg-main border-main" : "border-sub/40"
        }`}
        aria-hidden="true"
      >
        <Check
          size={11}
          strokeWidth={3}
          className={`text-bg transition-transform ${checked ? "scale-100" : "scale-0"}`}
        />
      </span>
    </span>
  );
}
