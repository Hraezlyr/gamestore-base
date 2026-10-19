import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function AnimatedSection({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.25 }}
    >
      {children}
    </motion.section>
  );
}
