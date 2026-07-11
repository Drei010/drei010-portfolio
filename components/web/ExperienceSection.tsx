import { experienceData } from "@/lib/data/experience";

export function ExperienceSection() {
  return (
    <section id="experience" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-xl font-bold sm:text-2xl">Experience</h2>
        <div className="relative space-y-8 border-l border-border pl-6">
          {experienceData.map((exp) => (
            <div key={exp.id} className="relative">
              <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold">{exp.role}</h3>
                <span className="text-xs text-muted">
                  {exp.startDate} — {exp.endDate}
                </span>
              </div>
              <p className="mb-2 text-sm text-primary">{exp.company}</p>
              <p className="mb-3 text-sm text-muted">{exp.description}</p>
              <ul className="space-y-1">
                {exp.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground/70 before:mr-2 before:content-['•']"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
