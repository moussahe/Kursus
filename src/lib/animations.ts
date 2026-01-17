/**
 * KURSUS Animation Library
 * Reusable Framer Motion variants and spring configurations
 */

import type { Variants, Transition } from "framer-motion";

// =============================================================================
// SPRING CONFIGURATIONS
// =============================================================================

export const springs = {
  /** Fast and snappy - buttons, toggles */
  snappy: { type: "spring", stiffness: 400, damping: 25 } as Transition,
  /** Soft - modals, cards */
  gentle: { type: "spring", stiffness: 300, damping: 30 } as Transition,
  /** Bounce - celebrations */
  bouncy: {
    type: "spring",
    stiffness: 500,
    damping: 20,
    bounce: 0.4,
  } as Transition,
  /** Smooth - page transitions */
  smooth: { type: "spring", stiffness: 200, damping: 25 } as Transition,
  /** Stiff - precise movements */
  stiff: { type: "spring", stiffness: 500, damping: 40 } as Transition,
};

// =============================================================================
// FADE VARIANTS
// =============================================================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// =============================================================================
// SCALE VARIANTS
// =============================================================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleInCenter: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: { opacity: 0, scale: 0.8 },
};

// =============================================================================
// SLIDE VARIANTS
// =============================================================================

export const slideUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

// =============================================================================
// STAGGER CONTAINER
// =============================================================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// =============================================================================
// CELEBRATION VARIANTS
// =============================================================================

export const confetti: Variants = {
  initial: { scale: 0, rotate: 0 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const celebrationPop: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.3, 0.9, 1.1, 1],
    opacity: 1,
    transition: {
      duration: 0.6,
      times: [0, 0.4, 0.6, 0.8, 1],
    },
  },
};

export const sparkle: Variants = {
  initial: { scale: 0, rotate: 0, opacity: 0 },
  animate: {
    scale: [0, 1, 0],
    rotate: [0, 180, 360],
    opacity: [0, 1, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatDelay: 0.2,
    },
  },
};

// =============================================================================
// HOVER VARIANTS
// =============================================================================

export const hoverLift = {
  rest: { y: 0, transition: springs.gentle },
  hover: { y: -4, transition: springs.gentle },
  tap: { y: 0, scale: 0.98, transition: springs.snappy },
};

export const hoverScale = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: springs.gentle },
  tap: { scale: 0.98, transition: springs.snappy },
};

export const hoverGlow = {
  rest: { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)" },
  hover: {
    boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.3)",
    transition: { duration: 0.3 },
  },
};

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const buttonBounce = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: springs.bouncy },
  tap: { scale: 0.95, transition: springs.snappy },
};

// =============================================================================
// CARD VARIANTS
// =============================================================================

export const cardHover: Variants = {
  initial: { y: 0 },
  hover: {
    y: -8,
    transition: springs.gentle,
  },
};

export const cardFlip: Variants = {
  initial: { rotateY: 0 },
  flipped: {
    rotateY: 180,
    transition: { duration: 0.6 },
  },
};

// =============================================================================
// MODAL VARIANTS
// =============================================================================

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const modalSlideUp: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// PAGE TRANSITION VARIANTS
// =============================================================================

export const pageSlide: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// =============================================================================
// LIST ITEM VARIANTS
// =============================================================================

export const listItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

export const listItemWithDrag = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9 },
  drag: { scale: 1.02, boxShadow: "0 5px 20px rgba(0,0,0,0.15)" },
};

// =============================================================================
// NOTIFICATION VARIANTS
// =============================================================================

export const notification: Variants = {
  initial: { opacity: 0, y: -50, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

export const toast: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// PROGRESS VARIANTS
// =============================================================================

export const progressBar = (percentage: number): Variants => ({
  initial: { width: 0 },
  animate: {
    width: `${percentage}%`,
    transition: { duration: 0.8, ease: "easeOut" },
  },
});

export const progressCircle = (percentage: number): Variants => ({
  initial: { pathLength: 0 },
  animate: {
    pathLength: percentage / 100,
    transition: { duration: 1, ease: "easeOut" },
  },
});

// =============================================================================
// SKELETON VARIANTS
// =============================================================================

export const skeleton: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates a delay for animations
 */
export const withDelay = (variants: Variants, delay: number): Variants => ({
  ...variants,
  animate: {
    ...variants.animate,
    transition: {
      ...(typeof variants.animate === "object" &&
      "transition" in variants.animate
        ? variants.animate.transition
        : {}),
      delay,
    },
  },
});

/**
 * Creates stagger children with custom delay
 */
export const createStaggerContainer = (
  staggerDelay = 0.1,
  initialDelay = 0.1,
): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: initialDelay,
    },
  },
});

/**
 * Creates a custom spring transition
 */
export const createSpring = (
  stiffness = 300,
  damping = 30,
  mass = 1,
): Transition => ({
  type: "spring",
  stiffness,
  damping,
  mass,
});
