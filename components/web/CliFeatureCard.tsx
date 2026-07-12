"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useView } from "@/lib/view-context";

const features = [
  "AI-powered responses",
  "Tab completion",
  "Command history",
  "Orange-on-black hacker aesthetic",
];

export function CliFeatureCard() {
  const { toggleView, setCliCardVisible } = useView();
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCliCardVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [setCliCardVisible]);

  const entranceVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={cardRef}
      className="group relative flex flex-col rounded-xl border border-border bg-background p-6 transition-[border-color,box-shadow] duration-300 hover:border-primary/70 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      }}
    >
      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]" />

      {/* Icon */}
      <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt text-primary transition-colors duration-300 group-hover:bg-primary/20">
        <TerminalIcon />
      </div>

      {/* Heading */}
      <h3 className="mb-2 text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
        CLI Mode
      </h3>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-muted">
        Explore my portfolio through an interactive terminal with a hacker
        aesthetic.
      </p>

      {/* Feature list */}
      <ul className="mb-6 space-y-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-foreground/80"
          >
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={toggleView}
        className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
        aria-label="Switch to CLI view"
      >
        <TerminalIcon />
        Try CLI
      </button>
    </motion.div>
  );
}

function TerminalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}
