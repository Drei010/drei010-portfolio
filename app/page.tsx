"use client";

import { useView } from "@/lib/view-context";
import { AboutSection } from "@/components/web/AboutSection";
import { ServicesSection } from "@/components/web/ServicesSection";
import { SkillsProjectsConnected } from "@/components/web/SkillsProjectsConnected";
import { ContactSection } from "@/components/web/ContactSection";
import { ConstellationBackground } from "@/components/web/ConstellationBackground";
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
    <div className="relative flex flex-1 flex-col animate-fade-in">
      <ConstellationBackground
        className="pointer-events-none fixed inset-0 z-0"
      />
      <div className="relative z-10">
        <AboutSection />
        <ServicesSection />
        <SkillsProjectsConnected />
        <ContactSection />
      </div>
    </div>
  );
}
