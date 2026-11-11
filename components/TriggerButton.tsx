"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function TriggerButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: string;
  className?: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className={`inline-flex ${className}`}>
      <Link
        href={href}
        className="group inline-flex items-center gap-2.5 rounded-xl bg-main px-6 py-3.5 text-sm font-semibold text-bg transition-[filter] hover:brightness-110"
      >
        {children}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}
