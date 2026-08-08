"use client";

import { useState } from "react";
import { projectsData } from "@/lib/data/projects";
import { ProjectCard } from "@/components/web/ProjectCard";
import { ProjectModal } from "@/components/web/ProjectModal";
import { AnimatedHeading } from "@/components/web/AnimatedHeading";
import { Project } from "@/lib/types";

type ProjectsSectionProps = {
  activeSkill?: string | null;
  projectRefs?: (id: string, el: HTMLElement | null) => void;
};

export function ProjectsSection({
  activeSkill,
  projectRefs,
}: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="projects" className="border-y border-border/70 bg-surface/45 px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <AnimatedHeading className="mb-10 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Projects
        </AnimatedHeading>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projectsData.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onSelect={setSelectedProject}
              highlighted={
                !!activeSkill && project.techStack.includes(activeSkill)
              }
              cardRef={(el) => projectRefs?.(project.id, el)}
            />
          ))}
        </div>
      </div>
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
