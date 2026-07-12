"use client";

import { useRef } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { skillsData } from "@/lib/data/skills";

type SkillCloudProps = {
  activeSkill: string | null;
  onSkillClick: (skill: string, element: HTMLElement) => void;
};

export function SkillCloud({ activeSkill, onSkillClick }: SkillCloudProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const badgeVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 },
  };

  return (
    <section id="skills" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-xl font-bold sm:text-2xl">Skills</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {skillsData.map((category, categoryIndex) => (
            <SkillCategoryCluster
              key={category.name}
              categoryName={category.name}
              skills={category.skills}
              categoryIndex={categoryIndex}
              activeSkill={activeSkill}
              onSkillClick={onSkillClick}
              containerVariants={containerVariants}
              badgeVariants={badgeVariants}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type SkillCategoryClusterProps = {
  categoryName: string;
  skills: string[];
  categoryIndex: number;
  activeSkill: string | null;
  onSkillClick: (skill: string, element: HTMLElement) => void;
  containerVariants: Variants;
  badgeVariants: Variants;
  shouldReduceMotion: boolean | null;
};

function SkillCategoryCluster({
  categoryName,
  skills,
  categoryIndex,
  activeSkill,
  onSkillClick,
  containerVariants,
  badgeVariants,
  shouldReduceMotion,
}: SkillCategoryClusterProps) {
  const clusterRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={clusterRef}
      className="group/cluster relative rounded-xl border border-border p-4 transition-[border-color,background-color,box-shadow] duration-300 hover:border-primary/40 hover:bg-surface-alt/50 hover:shadow-[0_0_16px_rgba(249,115,22,0.08)]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: categoryIndex * 0.1,
      }}
    >
      {/* Category highlight background */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/cluster:opacity-[0.03]" />

      <h3 className="relative mb-3 text-sm font-semibold uppercase tracking-wider text-muted transition-colors duration-300 group-hover/cluster:text-primary/80">
        {categoryName}
      </h3>
      <div className="relative flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge
            key={skill}
            skill={skill}
            isActive={activeSkill === skill}
            onSkillClick={onSkillClick}
            badgeVariants={badgeVariants}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>
    </motion.div>
  );
}

type SkillBadgeProps = {
  skill: string;
  isActive: boolean;
  onSkillClick: (skill: string, element: HTMLElement) => void;
  badgeVariants: Variants;
  shouldReduceMotion: boolean | null;
};

function SkillBadge({
  skill,
  isActive,
  onSkillClick,
  badgeVariants,
  shouldReduceMotion,
}: SkillBadgeProps) {
  const badgeRef = useRef<HTMLButtonElement>(null);

  return (
    <motion.button
      ref={badgeRef}
      className={`rounded-md px-2.5 py-1 text-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
        isActive
          ? "bg-primary/20 text-primary ring-1 ring-primary/60 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          : "bg-surface-alt text-foreground/80 hover:bg-primary/10 hover:text-primary"
      }`}
      variants={badgeVariants}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      onClick={() => {
        if (badgeRef.current) {
          onSkillClick(skill, badgeRef.current);
        }
      }}
      aria-label={`${skill}${isActive ? " (active, showing connections)" : ""}`}
      aria-pressed={isActive}
    >
      {skill}
    </motion.button>
  );
}
