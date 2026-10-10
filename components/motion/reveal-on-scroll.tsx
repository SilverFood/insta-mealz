"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { revealVariants } from "@/components/motion/presets";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  delay?: number;
};

export function RevealOnScroll({ children, className, as = "div", delay = 0 }: RevealOnScrollProps) {
  const reduced = useReducedMotion() ?? false;
  const Component = motion[as];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}
