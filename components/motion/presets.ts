import type { Transition, Variants } from "framer-motion";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const duration = {
  page: 0.32,
  overlay: 0.2,
  panel: 0.35,
  stagger: 0.05,
  micro: 0.2,
} as const;

export function instantIfReduced(reduced: boolean, value: number) {
  return reduced ? 0 : value;
}

export function pageTransition(reduced: boolean): Transition {
  return {
    duration: instantIfReduced(reduced, duration.page),
    ease: easeOut,
  };
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function panelRightVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  };
}

export function panelLeftVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  };
}

export function panelBottomVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  };
}

export function modalCenterVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 8 },
  };
}

export const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

export const staggerContainerVariants = gridContainerVariants;
export const staggerItemVariants = gridItemVariants;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export const heroStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

/** Crossfade with subtle scale — keeps layout stable while slides change. */
export const carouselSlideVariants: Variants = {
  enter: { opacity: 0, scale: 0.97 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: easeOut } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.38, ease: easeOut } },
};

export const carouselCaptionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: easeOut } },
};

export const lineItemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

export const tapScale = { scale: 0.97 };
export const hoverLift = { y: -2 };
