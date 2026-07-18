"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useView } from "@/lib/view-context";

const features = [
  "Physics-based driving",
  "Collectible portfolio items",
  "Progressive difficulty",
];

export function GameFeatureCard() {
  const { setView, setGameCardVisible } = useView();
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setGameCardVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [setGameCardVisible]);

  const entranceVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={cardRef}
      className="group relative flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/70 hover:shadow-md hover:shadow-primary/10 dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3,
      }}
    >
      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]" />

      {/* Icon */}
      <div className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt text-primary transition-colors duration-300 group-hover:bg-primary/20">
        <GamepadIcon />
      </div>

      {/* Heading */}
      <h3 className="mb-2 text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
        Game Mode
      </h3>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-muted">
        Explore my portfolio by playing a hill climb racing game. Drive, collect items, and discover my work in a fun way.
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
        onClick={() => setView("game")}
        className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
        aria-label="Switch to game view"
      >
        <GamepadIcon />
        Play Game
      </button>
    </motion.div>
  );
}

function GamepadIcon() {
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
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  );
}
