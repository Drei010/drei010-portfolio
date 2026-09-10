import { aboutData } from "@/lib/data/about";
import { servicesData } from "@/lib/data/services";
import { skillsData } from "@/lib/data/skills";
import { projectsData } from "@/lib/data/projects";
import { contactData } from "@/lib/data/contact";
import type { PortfolioItem } from "./types";

export const CHAPTERS = ["about", "services", "skills", "projects", "contact"] as const;
export const CHAPTER_COLORS = {
  about: "#fbbf24", services: "#38bdf8", skills: "#34d399", projects: "#c4b5fd", contact: "#f9a8d4",
};

export const portfolioItems: PortfolioItem[] = [
  { id: "about", type: "about", title: aboutData.name, summary: `${aboutData.title}. ${aboutData.bio}` },
  ...servicesData.map(item => ({ id: item.id, type: "services" as const, title: item.title, summary: item.description })),
  ...skillsData.map(item => ({ id: `skills-${item.name}`, type: "skills" as const, title: item.name, summary: item.skills.join(", ") })),
  ...projectsData.map(item => ({
    id: item.id, type: "projects" as const, title: item.title, summary: item.description,
    actions: [
      ...(item.liveUrl ? [{ label: "Live project", href: item.liveUrl }] : []),
      ...(item.repoUrl ? [{ label: "View code", href: item.repoUrl }] : []),
    ],
  })),
  { id: "contact", type: "contact", title: "Let’s build something.", summary: contactData.email,
    actions: [{ label: "Email Andrei", href: `mailto:${contactData.email}` }, ...contactData.links.map(link => ({ label: link.platform, href: link.url }))] },
];
