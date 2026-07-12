"use client";

import { motion, useReducedMotion } from "motion/react";
import { Project } from "@/lib/types";

type ProjectCardProps = {
  project: Project;
  index: number;
  onSelect?: (project: Project) => void;
  highlighted?: boolean;
  cardRef?: (el: HTMLElement | null) => void;
};

export function ProjectCard({
  project,
  index,
  onSelect,
  highlighted = false,
  cardRef,
}: ProjectCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const entranceVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <motion.article
      ref={cardRef}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-background transition-[border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
        highlighted
          ? "border-primary/70 shadow-[0_0_24px_rgba(249,115,22,0.2)]"
          : "border-border hover:border-primary/70 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
      }`}
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
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${project.title}`}
      onClick={() => onSelect?.(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(project);
        }
      }}
    >
      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]" />

      <div className="aspect-video w-full bg-surface-alt">
        <div className="flex h-full items-center justify-center text-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 text-lg font-semibold transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">
          {project.description}
        </p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded bg-surface-alt px-2 py-0.5 text-xs text-foreground/70"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
              aria-label={`View live demo of ${project.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              Live Demo ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted hover:text-foreground hover:underline"
              aria-label={`View source code of ${project.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              Source ↗
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
