import { Project } from "@/lib/types";

export const projectsData: Project[] = [
  {
    id: "project-1",
    title: "E-Commerce Platform",
    description:
      "A full-stack e-commerce application with real-time inventory management, payment processing, and admin dashboard.",
    thumbnail: "/projects/ecommerce.png",
    techStack: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Tailwind CSS"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/andreikylehidalgo/ecommerce",
  },
  {
    id: "project-2",
    title: "AI Chat Application",
    description:
      "A conversational AI interface with RAG capabilities, supporting multiple LLM providers and document ingestion.",
    thumbnail: "/projects/ai-chat.png",
    techStack: ["React", "Python", "FastAPI", "OpenAI", "Pinecone"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/andreikylehidalgo/ai-chat",
  },
  {
    id: "project-3",
    title: "Task Management System",
    description:
      "A collaborative project management tool with real-time updates, Kanban boards, and team workflows.",
    thumbnail: "/projects/taskmanager.png",
    techStack: ["Next.js", "TypeScript", "Prisma", "WebSockets", "AWS"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/andreikylehidalgo/taskmanager",
  },
  {
    id: "project-4",
    title: "Developer Portfolio",
    description:
      "This portfolio site — a dual-view experience with a minimalist web interface and an interactive CLI terminal.",
    thumbnail: "/projects/portfolio.png",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    repoUrl: "https://github.com/andreikylehidalgo/portfolio",
  },
];
