"use client";

import { useView } from "@/lib/view-context";
import { AboutSection } from "@/components/web/AboutSection";
import { ServicesSection } from "@/components/web/ServicesSection";
import { SkillsProjectsConnected } from "@/components/web/SkillsProjectsConnected";
import { ContactSection } from "@/components/web/ContactSection";
import { Terminal } from "@/components/cli/Terminal";

export default function Home() {
  const { view } = useView();

  if (view === "cli") {
    return (
      <div className="flex flex-1 content-center animate-fade-in">
        <Terminal />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <AboutSection />
      <ServicesSection />
      <SkillsProjectsConnected />
      <ContactSection />
    </div>
  );
}
