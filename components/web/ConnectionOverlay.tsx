"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { projectsData } from "@/lib/data/projects";

type ConnectionLine = {
  id: string;
  path: string;
};

type ConnectionOverlayProps = {
  activeSkill: string | null;
  skillElement: HTMLElement | null;
  projectRefsMap: React.RefObject<Map<string, HTMLElement>>;
  containerRef: React.RefObject<HTMLElement | null>;
};

export function ConnectionOverlay({
  activeSkill,
  skillElement,
  projectRefsMap,
  containerRef,
}: ConnectionOverlayProps) {
  const shouldReduceMotion = useReducedMotion();
  const [lines, setLines] = useState<ConnectionLine[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const calculateLines = useCallback(() => {
    if (!activeSkill || !skillElement || !containerRef.current) {
      setLines([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const skillRect = skillElement.getBoundingClientRect();

    const matchingProjects = projectsData.filter((p) =>
      p.techStack.includes(activeSkill)
    );

    const projectRefs = projectRefsMap.current;
    const newLines: ConnectionLine[] = [];

    for (const project of matchingProjects) {
      const projectEl = projectRefs.get(project.id);
      if (!projectEl) continue;

      const projectRect = projectEl.getBoundingClientRect();

      const startX = skillRect.left + skillRect.width / 2 - containerRect.left;
      const startY = skillRect.bottom - containerRect.top;
      const endX =
        projectRect.left + projectRect.width / 2 - containerRect.left;
      const endY = projectRect.top - containerRect.top;

      const midY = startY + (endY - startY) * 0.5;
      const controlOffset = Math.abs(endX - startX) * 0.2;

      const path = `M ${startX} ${startY} C ${startX + controlOffset} ${midY}, ${endX - controlOffset} ${midY}, ${endX} ${endY}`;

      newLines.push({ id: project.id, path });
    }

    setSvgSize({
      width: containerRect.width,
      height: containerRect.height,
    });
    setLines(newLines);
  }, [activeSkill, skillElement, projectRefsMap, containerRef]);

  useEffect(() => {
    calculateLines();

    const handleResize = () => calculateLines();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [calculateLines]);

  if (!activeSkill || svgSize.width === 0) {
    return null;
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 hidden sm:block"
      width={svgSize.width}
      height={svgSize.height}
      aria-hidden="true"
    >
      <AnimatePresence>
        {lines.map((line, index) => (
          <motion.path
            key={line.id}
            d={line.path}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.6}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { pathLength: 1, opacity: 0.6 }
                : { pathLength: 1, opacity: 0.6 }
            }
            exit={{ pathLength: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.1 }
                : {
                    pathLength: {
                      type: "spring",
                      stiffness: 50,
                      damping: 15,
                      delay: index * 0.1,
                    },
                    opacity: { duration: 0.3, delay: index * 0.1 },
                  }
            }
          />
        ))}
      </AnimatePresence>
    </svg>
  );
}
