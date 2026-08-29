/**
 * motionTimeline.ts — Master Animation Registry (GOD MODE v3 Layer 2)
 *
 * Every animated element in CodeVerse pulls from this central, typed registry.
 * No component should define bespoke transition objects outside this file.
 * This ensures consistent motion across all 30+ topic pages.
 */

import type { Variants, Transition } from "framer-motion";

// ============================================================
// BASE SPRING PHYSICS (the "CodeVerse spring")
// ============================================================
export const SPRING_BASE: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 14,
};

export const SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 20,
};

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 18,
};

// ============================================================
// PAGE-LEVEL ORCHESTRATION TIMELINE
// Sequence: Camera Zoom → Background Awake → Particles → Glass Refraction
//           → Nodes Glow → Edges Draw → Text Reveal → Interactive Mode
// ============================================================
export const PAGE_ENTER: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      ...SPRING_GENTLE,
      duration: 0.9,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

export const STAGGER_CHILD: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_BASE,
  },
};

export const STAGGER_FAST: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SNAPPY,
  },
};

// ============================================================
// COMPONENT-LEVEL TIMELINES
// ============================================================

/** Hero section — Camera Zoom + 3D Glow (900–1200ms) */
export const HERO_ENTER: Variants = {
  hidden: { opacity: 0, scale: 1.08, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...SPRING_GENTLE, duration: 1.2 },
  },
};

/** Glass card — enters with subtle scale + blur */
export const CARD_ENTER: Variants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: SPRING_BASE,
  },
  hover: {
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

/** 3D tilt card — pointer-move driven (computed separately via hook) */
export const TILT_CONFIG = {
  duration: "250ms",
  perspective: 1200,
  maxTilt: 8, // degrees
  glare: true,
  glareMaxOpacity: 0.12,
};

/** Graph node — continuous pulse (2000ms loop) */
export const NODE_PULSE: Variants = {
  animate: {
    scale: [1, 1.03, 1],
    opacity: [0.85, 1, 0.85],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
    },
  },
};

/** Module orb float (Galaxy Map — 6s loop, y offset -8px) */
export const ORB_FLOAT: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
    },
  },
};

/** SearchModal open/close (blur + scale, 180–220ms) */
export const SEARCH_MODAL: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    filter: "blur(8px)",
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
  },
};

/** Accordion / InterviewCard liquid expand (350–400ms) */
export const ACCORDION_CONTENT: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
  visible: {
    height: "auto",
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      height: { duration: 0.35, ease: [0, 0, 0.2, 1] },
      opacity: { duration: 0.25, delay: 0.05 },
      filter: { duration: 0.25, delay: 0.05 },
    },
  },
};

/** Tooltip float-in (120–160ms) */
export const TOOLTIP_ENTER: Variants = {
  hidden: { opacity: 0, y: 4, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.96,
    transition: { duration: 0.1 },
  },
};

/** AnimatedDiagram draw-on entrance (700–900ms) */
export const DIAGRAM_ENTER: Variants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.85, ease: "easeOut" },
  },
};

/** Diagram node sequential stagger */
export const DIAGRAM_NODE_STAGGER: Variants = {
  hidden: { opacity: 0, scale: 0.7, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...SPRING_BASE },
  },
};

/** Edge energy dot travel (GSAP — config only, not Framer) */
export const EDGE_ENERGY_CONFIG = {
  duration: 1.5, // seconds per cycle
  ease: "none",
  repeat: -1,
};

/** Background aurora (continuous, gated by useInView) */
export const AURORA_CONFIG = {
  duration: 8000, // ms
  keyframes: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    opacity: [0.6, 0.9, 0.6],
  },
};

/** Scroll reveal (IntersectionObserver + Framer) */
export const SCROLL_REVEAL: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING_BASE, delay: 0.1 },
  },
};

/** Bottom sheet drag-up (mobile) */
export const BOTTOM_SHEET: Variants = {
  closed: { y: "90%" },
  peek: { y: "50%" },
  open: { y: "10%" },
};

/** Route transition shared config */
export const ROUTE_TRANSITION = {
  initial: { opacity: 0, scale: 1.02, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
};

/** Gamification achievement toast */
export const ACHIEVEMENT_TOAST: Variants = {
  hidden: { x: "120%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { ...SPRING_SNAPPY },
  },
  exit: {
    x: "120%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

/** Ripple (tap feedback) */
export const RIPPLE_CONFIG = {
  initial: { scale: 0, opacity: 0.8 },
  animate: { scale: 4, opacity: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};
