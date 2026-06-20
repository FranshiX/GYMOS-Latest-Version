import { Variants, Transition } from 'framer-motion';

// Page Transition (Screen Enter)
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransition: Transition = {
  duration: 0.25,
  ease: [0.0, 0.0, 0.2, 1],
};

// List Item Stagger (Cards, Exercise Lists)
export const listContainerVariants: Variants = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

// Set Completion Checkmark
export const checkVariants: Variants = {
  unchecked: { scale: 1, backgroundColor: 'var(--bg-elevated)' },
  checked: {
    scale: [1, 1.2, 1],
    backgroundColor: 'var(--color-success)',
    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// Exercise Card Collapse (After All Sets Done)
export const collapseVariants: Variants = {
  open: { height: 'auto', opacity: 1 },
  collapsed: {
    height: 64,
    opacity: 0.6,
    transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
  },
};

// Session Complete Celebration
export const celebrationVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export const statsRevealVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

// Bottom Sheet / Drawer Slide Up
export const drawerVariants: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1] },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25, ease: [0.4, 0.0, 1, 1] },
  },
};
