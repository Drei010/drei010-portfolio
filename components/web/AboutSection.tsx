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
      className="flex min-h-[calc(100vh-4rem)] items-center px-5 py-20 focus:outline-none sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] lg:gap-24">
        {/* Left column — About data */}
        <div className="self-center">
          <motion.h1
            className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-8xl"
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
            className="mt-6 text-base font-medium uppercase tracking-[0.18em] text-primary lg:text-lg"
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
            className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/75 lg:text-xl"
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
            className="mt-10 inline-flex items-center gap-3 border-b-2 border-primary pb-2 text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-primary lg:text-base"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <CliFeatureCard />
          <GameFeatureCard />
        </div>
      </div>
    </section>
  );
}
