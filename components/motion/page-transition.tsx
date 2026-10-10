"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageTransition, pageVariants } from "@/components/motion/presets";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div key={pathname} variants={pageVariants} initial="initial" animate="animate" transition={pageTransition(reduced)}>
      {children}
    </motion.div>
  );
}
