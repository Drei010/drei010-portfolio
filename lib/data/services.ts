import { Service } from "@/lib/types";

export const servicesData: Service[] = [
  {
    id: "web-development",
    title: "Web Development",
    description:
      "Building fast, responsive, and accessible web applications with modern frameworks and best practices.",
    highlights: [
      "Custom web apps with Next.js & React",
      "Responsive, mobile-first design",
      "Performance optimization & SEO",
      "API integration & full-stack solutions",
    ],
  },
  {
    id: "ai-integration",
    title: "AI Integration",
    description:
      "Integrating AI capabilities into products — from conversational interfaces to intelligent automation.",
    highlights: [
      "LLM-powered features & chatbots",
      "RAG pipelines & knowledge bases",
      "AI API integration (OpenAI, etc.)",
      "Intelligent workflow automation",
    ],
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "Designing intuitive, visually polished interfaces that prioritize usability and delight users.",
    highlights: [
      "User-centered interface design",
      "Design systems & component libraries",
      "Prototyping & interaction design",
      "Accessibility-first approach",
    ],
  },
];
