"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useView } from "@/lib/view-context";
import { AboutSection } from "@/components/web/AboutSection";
import { ServicesSection } from "@/components/web/ServicesSection";
import { SkillsProjectsConnected } from "@/components/web/SkillsProjectsConnected";
import { ContactSection } from "@/components/web/ContactSection";
import { ConstellationBackground } from "@/components/web/ConstellationBackground";
import { ScrollProgressBar } from "@/components/web/ScrollProgressBar";
import { Terminal } from "@/components/cli/Terminal";
import { GameCanvas } from "@/components/game/GameCanvas";

export default function Home() {
  const { view } = useView();
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0px", "-80px"]);

  if (view === "game") {
    return (
      <div className="flex min-h-0 flex-1 overflow-hidden animate-fade-in">
        <GameCanvas />
      </div>
    );
  }

  if (view === "cli") {
    return (
      <div className="dark flex flex-1 content-center animate-fade-in">
        <Terminal />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto animate-fade-in">
      <ScrollProgressBar />
      <motion.div
        className="pointer-events-none fixed -top-20 right-0 -bottom-20 left-0 z-0"
        style={{ y: shouldReduceMotion ? "0px" : parallaxY }}
      >
        <ConstellationBackground className="h-full w-full" />
      </motion.div>
      <div className="relative z-10">
        <AboutSection />
        <ServicesSection />
        <SkillsProjectsConnected />
        <ContactSection />
      </div>
    </div>
  );
}
