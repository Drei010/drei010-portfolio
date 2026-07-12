"use client";

import { motion, useReducedMotion } from "motion/react";
import { aboutData } from "@/lib/data/about";
import { CliFeatureCard } from "@/components/web/CliFeatureCard";

export function AboutSection() {
  const shouldReduceMotion = useReducedMotion();

  const textVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <section id="about" className="px-4 py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left column — About data */}
        <div>
          <motion.h1
            className="text-3xl font-bold sm:text-4xl"
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
            className="mt-2 text-lg font-medium text-primary"
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
            className="mt-4 text-base leading-relaxed text-foreground/80"
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
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-background transition-colors duration-200 hover:bg-primary-dim focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
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

        {/* Right column — CLI Feature Card */}
        <CliFeatureCard />
      </div>
    </section>
  );
}
