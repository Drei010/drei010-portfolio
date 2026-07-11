"use client";

import { useView } from "@/lib/view-context";
import { AboutSection } from "@/components/web/AboutSection";
import { SkillsSection } from "@/components/web/SkillsSection";
import { ProjectsSection } from "@/components/web/ProjectsSection";
import { ExperienceSection } from "@/components/web/ExperienceSection";
import { ContactSection } from "@/components/web/ContactSection";
import { Terminal } from "@/components/cli/Terminal";

export default function Home() {
  const { view } = useView();

  if (view === "cli") {
    return (
      <div className="flex flex-1 animate-fade-in">
        <Terminal />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
    </div>
  );
}
