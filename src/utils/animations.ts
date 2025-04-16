import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const metricAnimation: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export const pulseAnimation: Variants = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
