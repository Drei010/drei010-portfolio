"use client";

import { motion, useReducedMotion } from "motion/react";
import { Service } from "@/lib/types";

type ServiceCardProps = {
  service: Service;
  index: number;
};

export function ServiceCard({ service, index }: ServiceCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const entranceVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 24 },
    visible: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="group relative flex flex-col rounded-xl border border-border p-4 transition-[border-color,box-shadow] duration-300 hover:border-primary/70 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.15,
      }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      tabIndex={0}
    >
      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]" />

      {/* Icon */}
      <motion.div
        className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt text-primary transition-colors duration-300 group-hover:bg-primary/20"
        variants={{
          rest: { scale: 1, rotate: 0 },
          hover: { scale: 1.1, rotate: 3 },
        }}
        initial="rest"
        whileHover="hover"
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <ServiceIcon serviceId={service.id} />
      </motion.div>

      {/* Title */}
      <h3 className="mb-2 text-base font-semibold transition-colors duration-300 group-hover:text-primary">
        {service.title}
      </h3>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-muted">
        {service.description}
      </p>

      {/* Highlights */}
      <ul className="mt-auto space-y-1.5">
        {service.highlights.map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2 text-sm text-foreground/80"
          >
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            {highlight}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ServiceIcon({ serviceId }: { serviceId: string }) {
  switch (serviceId) {
    case "web-development":
      return <CodeIcon />;
    case "ai-integration":
      return <BrainIcon />;
    case "ui-ux-design":
      return <PaletteIcon />;
    default:
      return null;
  }
}

function CodeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M12 18v-5" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
    </svg>
  );
}
