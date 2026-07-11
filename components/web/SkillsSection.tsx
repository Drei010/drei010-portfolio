import { skillsData } from "@/lib/data/skills";

export function SkillsSection() {
  return (
    <section id="skills" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-xl font-bold sm:text-2xl">Skills</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {skillsData.map((category) => (
            <div key={category.name} className="rounded-xl border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-surface-alt px-2.5 py-1 text-sm text-foreground/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
