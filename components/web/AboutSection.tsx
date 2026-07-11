import { aboutData } from "@/lib/data/about";

export function AboutSection() {
  return (
    <section id="about" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt text-2xl font-bold text-primary sm:h-20 sm:w-20 sm:text-3xl">
            {aboutData.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{aboutData.name}</h1>
            <p className="text-muted">{aboutData.title}</p>
          </div>
        </div>
        <p className="text-lg leading-relaxed text-foreground/80">
          {aboutData.bio}
        </p>
        <p className="mt-4 text-sm text-muted">📍 {aboutData.location}</p>
      </div>
    </section>
  );
}
