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
    <section id="projects" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <AnimatedHeading className="mb-8 text-xl font-bold sm:text-2xl">
          Projects
        </AnimatedHeading>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
