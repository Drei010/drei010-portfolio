"use client";

import { motion, useReducedMotion } from "motion/react";
import { aboutData } from "@/lib/data/about";
import { CliFeatureCard } from "@/components/web/CliFeatureCard";
import { GameFeatureCard } from "@/components/web/GameFeatureCard";

export function AboutSection() {
  const shouldReduceMotion = useReducedMotion();

  const textVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <section
      id="about"
      tabIndex={-1}
      className="flex min-h-[calc(100vh-3.5rem)] focus:outline-none items-center px-4 py-16 sm:py-24 lg:px-8 lg:py-0"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:max-w-7xl lg:grid-cols-[2fr_1fr_1fr] lg:items-stretch lg:gap-10">
        {/* Left column — About data */}
        <div className="self-center">
          <motion.h1
            className="text-3xl font-bold sm:text-4xl lg:text-5xl"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0,
            }}
          >
            {aboutData.name}
          </motion.h1>

          <motion.p
            className="mt-3 text-lg font-medium text-primary lg:text-xl"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.1,
            }}
          >
            {aboutData.title}
          </motion.p>

          <motion.p
            className="mt-4 text-base leading-relaxed text-foreground/80 lg:text-lg"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.2,
            }}
          >
            {aboutData.bio}
          </motion.p>

          <motion.a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-background transition-colors duration-200 hover:bg-primary-dim focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none lg:text-base"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.3,
            }}
          >
            Get in Touch
          </motion.a>
        </div>

        {/* Feature Cards as separate grid columns */}
        <CliFeatureCard />
        <GameFeatureCard />
      </div>
    </section>
  );
}
