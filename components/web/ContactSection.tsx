"use client";

import { motion, useReducedMotion } from "motion/react";
import { ContactForm } from "@/components/web/ContactForm";
import { ContactLinks } from "@/components/web/ContactLinks";
import { AnimatedHeading } from "@/components/web/AnimatedHeading";

export function ContactSection() {
  const shouldReduceMotion = useReducedMotion();

  const subtitleVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

  return (
    <section id="contact" className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <AnimatedHeading className="mb-8 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Contact
        </AnimatedHeading>
        <motion.p
          className="-mt-2 mb-12 max-w-xl text-lg leading-relaxed text-foreground/75"
          variants={subtitleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 20,
            delay: 0.15,
          }}
        >
          Interested in working together? Feel free to reach out.
        </motion.p>
        <div className="grid grid-cols-1 gap-12 border-t border-border pt-10 md:grid-cols-[1.1fr_0.9fr] md:gap-20">
          <ContactForm />
          <ContactLinks />
        </div>
      </div>
    </section>
  );
}
