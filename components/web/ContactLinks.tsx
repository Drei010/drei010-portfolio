"use client";

import { motion, useReducedMotion } from "motion/react";
import { contactData } from "@/lib/data/contact";

export function ContactLinks() {
  const shouldReduceMotion = useReducedMotion();

  const entranceVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } };

  const linkedInLink = contactData.links.find(
    (link) => link.platform === "LinkedIn"
  );

  return (
    <motion.div
      className="space-y-4"
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        delay: 0.2,
      }}
    >
      <h3 className="text-sm font-medium text-muted">Get in touch</h3>

      <a
        href={`mailto:${contactData.email}`}
        className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm shadow-sm transition-[colors,box-shadow] hover:border-primary hover:text-primary dark:shadow-none"
        aria-label={`Send email to ${contactData.email}`}
      >
        <MailIcon />
        <span>{contactData.email}</span>
      </a>

      {linkedInLink && (
        <a
          href={linkedInLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm shadow-sm transition-[colors,box-shadow] hover:border-primary hover:text-primary dark:shadow-none"
          aria-label={`Visit LinkedIn profile`}
        >
          <LinkedInIcon />
          <span>{linkedInLink.label}</span>
          <span className="ml-auto text-muted">↗</span>
        </a>
      )}
    </motion.div>
  );
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
