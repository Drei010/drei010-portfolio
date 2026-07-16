"use client";

import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "motion/react";
import { useView } from "@/lib/view-context";
import { AboutSection } from "@/components/web/AboutSection";
import { ServicesSection } from "@/components/web/ServicesSection";
import { SkillsProjectsConnected } from "@/components/web/SkillsProjectsConnected";
import { ContactSection } from "@/components/web/ContactSection";
import { ConstellationBackground } from "@/components/web/ConstellationBackground";
import { ScrollProgressBar } from "@/components/web/ScrollProgressBar";
import { Terminal } from "@/components/cli/Terminal";
import { GameCanvas } from "@/components/game/GameCanvas";

const viewTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const gameTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Home() {
  const { view } = useView();
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0px", "-80px"]);

  return (
    <AnimatePresence mode="wait">
      {view === "game" && (
        <motion.div
          key="game"
          className="flex min-h-0 flex-1 overflow-hidden"
          initial={shouldReduceMotion ? { opacity: 0 } : gameTransition.initial}
          animate={shouldReduceMotion ? { opacity: 1 } : gameTransition.animate}
          exit={shouldReduceMotion ? { opacity: 0 } : gameTransition.exit}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <GameCanvas />
        </motion.div>
      )}

      {view === "cli" && (
        <motion.div
          key="cli"
          className="dark flex flex-1 content-center"
          initial={shouldReduceMotion ? { opacity: 0 } : viewTransition.initial}
          animate={shouldReduceMotion ? { opacity: 1 } : viewTransition.animate}
          exit={shouldReduceMotion ? { opacity: 0 } : viewTransition.exit}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Terminal />
        </motion.div>
      )}

      {view === "web" && (
        <motion.div
          key="web"
          className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto"
          initial={shouldReduceMotion ? { opacity: 0 } : viewTransition.initial}
          animate={shouldReduceMotion ? { opacity: 1 } : viewTransition.animate}
          exit={shouldReduceMotion ? { opacity: 0 } : viewTransition.exit}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
