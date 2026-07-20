import "server-only";

import { aboutData } from "@/lib/data/about";
import { contactData } from "@/lib/data/contact";
import { projectsData } from "@/lib/data/projects";
import { servicesData } from "@/lib/data/services";
import { skillsData } from "@/lib/data/skills";

export function buildPortfolioContext(): string {
  const publicPortfolio = {
    about: aboutData,
    skills: skillsData,
    services: servicesData,
    projects: projectsData,
    contact: contactData,
  };

  return JSON.stringify(publicPortfolio, null, 2);
}
