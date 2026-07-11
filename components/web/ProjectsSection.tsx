import { projectsData } from "@/lib/data/projects";
import { ProjectCard } from "@/components/web/ProjectCard";

export function ProjectsSection() {
  return (
    <section id="projects" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-xl font-bold sm:text-2xl">Projects</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {projectsData.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
