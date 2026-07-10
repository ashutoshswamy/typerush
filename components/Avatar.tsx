"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Google (and other) photo hosts 403 without a bare referrer, and any
// avatar host can hiccup — fall back to the initial glyph rather than a
// broken image icon.
export function Avatar({ src, label, size = 44 }: { src: string | null | undefined; label: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = src && !failed;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-full border border-main/40 overflow-hidden flex items-center justify-center bg-sub-alt shrink-0"
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-display text-main" style={{ fontSize: size * 0.4 }}>
          {label[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </motion.div>
  );
}
