"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import {
  backdropVariants,
  duration,
  instantIfReduced,
  modalCenterVariants,
  panelBottomVariants,
  panelLeftVariants,
  panelRightVariants,
} from "@/components/motion/presets";

type PanelSide = "right" | "left" | "bottom" | "center";

function panelVariants(side: PanelSide, reduced: boolean) {
  if (side === "right") return panelRightVariants(reduced);
  if (side === "left") return panelLeftVariants(reduced);
  if (side === "bottom") return panelBottomVariants(reduced);
  return modalCenterVariants(reduced);
}

export function AnimatedOverlay({
  open,
  onClose,
  side,
  children,
  className,
  panelClassName,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  side: PanelSide;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const isCenter = side === "center";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-0 z-50 flex ${isCenter ? "items-end justify-center bg-black/40 md:items-center" : side === "right" ? "justify-end bg-black/40" : side === "left" ? "justify-start bg-black/40" : "items-end justify-center bg-black/40 md:items-center"} ${className ?? ""}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: instantIfReduced(reduced, duration.overlay) }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={panelClassName}
            variants={panelVariants(side, reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: instantIfReduced(reduced, duration.panel), ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
