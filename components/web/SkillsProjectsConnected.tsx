"use client";

import { useState, useRef, useCallback } from "react";
import { SkillCloud } from "@/components/web/SkillCloud";
import { ConnectionOverlay } from "@/components/web/ConnectionOverlay";
import { ProjectsSection } from "@/components/web/ProjectsSection";

export function SkillsProjectsConnected() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [skillElement, setSkillElement] = useState<HTMLElement | null>(null);
  const projectRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSkillClick = useCallback(
    (skill: string, element: HTMLElement) => {
      if (activeSkill === skill) {
        setActiveSkill(null);
        setSkillElement(null);
      } else {
        setActiveSkill(skill);
        setSkillElement(element);
      }
    },
    [activeSkill]
  );

  const handleProjectRef = useCallback(
    (id: string, el: HTMLElement | null) => {
      if (el) {
        projectRefsMap.current.set(id, el);
      } else {
        projectRefsMap.current.delete(id);
      }
    },
    []
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("button") &&
        !target.closest("article") &&
        !target.closest("a")
      ) {
        setActiveSkill(null);
        setSkillElement(null);
      }
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={handleContainerClick}
    >
      <SkillCloud activeSkill={activeSkill} onSkillClick={handleSkillClick} />

      <ConnectionOverlay
        activeSkill={activeSkill}
        skillElement={skillElement}
        projectRefsMap={projectRefsMap}
        containerRef={containerRef}
      />

      <ProjectsSection
        activeSkill={activeSkill}
        projectRefs={handleProjectRef}
      />

      {/* Accessibility announcement */}
      {activeSkill && (
        <div className="sr-only" aria-live="polite" role="status">
          Showing connections for {activeSkill}
        </div>
      )}
    </div>
  );
}
