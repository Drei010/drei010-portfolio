"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type AnimatedHeadingProps = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
};

export function AnimatedHeading({
  children,
  className,
  as = "h2",
  delay = 0,
}: AnimatedHeadingProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = motion[as];

  const variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
        visible: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
      };

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        delay,
      }}
    >
      {children}
    </Tag>
  );
}
