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
    <section id="contact" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <AnimatedHeading className="mb-8 text-xl font-bold sm:text-2xl">
          Contact
        </AnimatedHeading>
        <motion.p
          className="-mt-4 mb-8 text-foreground/80"
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
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <ContactForm />
          <ContactLinks />
        </div>
      </div>
    </section>
  );
}
