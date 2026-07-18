"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import { useWebScroll } from "@/lib/web-scroll-context";

export function ScrollProgressBar() {
  const { scrollContainerRef } = useWebScroll();
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const shouldReduceMotion = useReducedMotion();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const scaleX = shouldReduceMotion ? scrollYProgress : smoothProgress;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[3px] origin-left bg-primary"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
