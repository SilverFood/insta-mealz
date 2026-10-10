"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { revealVariants } from "@/components/motion/presets";

export function PageEntrance({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={revealVariants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
