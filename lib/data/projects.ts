import { Project } from "@/lib/types";

export const projectsData: Project[] = [
  {
    id: "project-1",
    title: "RAG Backend",
    description:
      "A Retrieval-Augmented Generation (RAG) backend service that integrates with OpenAI APIs to provide context-aware responses for various applications.",
    thumbnail: "/projects/rag-backend.png",
    techStack: ["FastAPI", "Python", "ChromaDB", "AWS S3 Bucket", "OpenAI", "LangChain", "Render"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/andreikylehidalgo/rag-backend",
  },
  {
    id: "project-2",
    title: "BiteScout AI Chat",
    description:
      "Hungry and looking for the perfect meal? BiteScout AI Chat helps you discover delicious options based on location.",
    thumbnail: "/projects/ai-chat.png",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "OpenAI", "Groq", "Foursquare APIs", "AI Integration", "Vercel"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/andreikylehidalgo/ai-chat",
  },
  {
    id: "project-3",
    title: "RehabBuddy, A AI Stroke Rehabilitation Companion",
    description:
      "A stroke rehabilitation companion that leverages AI to provide personalized exercises, progress tracking, and motivational support for patients.",
    thumbnail: "/projects/rehabbuddy.png",
    techStack: ["Next.js", "TypeScript", "Supabase", "OpenAI", "Groq", "Vercel"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/andreikylehidalgo/rehabbuddy",
  },
  {
    id: "project-4",
    title: "Developer Portfolio",
    description:
      "This portfolio site — a dual-view experience with a minimalist web interface and an interactive CLI terminal.",
    thumbnail: "/Drei010-resume-cli.png",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    repoUrl: "https://github.com/Drei010/drei010-portfolio",
  },
];
