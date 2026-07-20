import { contactData } from "@/lib/data/contact";
import { projectsData } from "@/lib/data/projects";
import { servicesData } from "@/lib/data/services";
import { skillsData } from "@/lib/data/skills";

export type PreparedAnswerDefinition = {
  id: string;
  aliases: readonly string[];
  keywords: readonly string[];
  minimumKeywordMatches: number;
  priority: number;
  response: string;
};

const skillSummary = skillsData
  .map((category) => `${category.name}: ${category.skills.join(", ")}`)
  .join("; ");

const projectNames = projectsData.map((project) => project.title).join(", ");
const serviceNames = servicesData.map((service) => service.title).join(", ");
const contactPlatforms = contactData.links.map((link) => link.platform).join(" and ");

export const preparedAnswers = [
  {
    id: "technology",
    aliases: [
      "what is your tech stack",
      "what is your technology stack",
      "what tech stack do you use",
      "what tools do you use",
    ],
    keywords: ["tech", "technology", "stack", "frameworks"],
    minimumKeywordMatches: 1,
    priority: 50,
    response: `My current skill set includes ${skillSummary}. Type 'skills' to see it by category.`,
  },
  {
    id: "projects",
    aliases: [
      "what projects have you built",
      "show me your work",
      "what have you built",
      "tell me about your projects",
    ],
    keywords: ["project", "projects", "portfolio"],
    minimumKeywordMatches: 1,
    priority: 40,
    response: `My featured projects are ${projectNames}. Type 'projects' for descriptions, technology, and links.`,
  },
  {
    id: "contact",
    aliases: [
      "how can i contact you",
      "how do i contact you",
      "how can i reach you",
      "are you available for work",
    ],
    keywords: ["contact", "email", "hire", "available"],
    minimumKeywordMatches: 1,
    priority: 60,
    response: `You can reach me at ${contactData.email}${
      contactPlatforms ? ` or find me on ${contactPlatforms}` : ""
    }. Type 'contact' for all links.`,
  },
  {
    id: "introduction",
    aliases: [
      "hello",
      "hi",
      "hey",
      "hello andrei",
      "hi andrei",
      "who are you",
      "what is your name",
      "tell me about yourself",
    ],
    keywords: [],
    minimumKeywordMatches: 0,
    priority: 70,
    response:
      "Hey! I'm Andrei Kyle Hidalgo, a full-stack developer based in the Philippines. I build enterprise systems and AI-powered web applications. Type 'about' for more.",
  },
  {
    id: "skills",
    aliases: [
      "what are your skills",
      "what are you good at",
      "what are your strengths",
      "tell me about your skills",
    ],
    keywords: ["skill", "skills", "strength", "strengths"],
    minimumKeywordMatches: 1,
    priority: 45,
    response: `My skills include ${skillSummary}. Type 'skills' for the complete categorized list.`,
  },
  {
    id: "services",
    aliases: [
      "what services do you offer",
      "how can you help me",
      "what work do you offer",
    ],
    keywords: ["service", "services"],
    minimumKeywordMatches: 1,
    priority: 35,
    response: `I offer ${serviceNames}. Type 'services' for details.`,
  },
] as const satisfies readonly PreparedAnswerDefinition[];
