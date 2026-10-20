import { Project } from "@/lib/types";

export const projectsData: Project[] = [
  {
    id: "project-1",
    title: "RAG Backend",
    description:
      "A Retrieval-Augmented Generation (RAG) backend service that integrates with OpenAI APIs to provide context-aware responses for various applications.",
    thumbnail: "/projects/rag-backend.svg",
    techStack: ["FastAPI", "Python", "ChromaDB", "AWS S3 Bucket", "OpenAI", "LangChain", "Render"],
    repoUrl: "https://github.com/Drei010/python-rag-learning",
  },
  {
    id: "project-2",
    title: "BiteScout",
    description:
      "A craving-led restaurant finder that turns natural-language food searches into a shortlist of nearby spots worth trying.",
    thumbnail: "/projects/bitescout.jpg",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "OpenAI", "Groq", "Foursquare APIs", "Vercel"],
    liveUrl: "https://bite-scout-seven.vercel.app",
    repoUrl: "https://github.com/Drei010/BiteScout",
  },
  {
    id: "project-3",
    title: "Lutoko",
    description:
      "A personal cooking archive for collecting and revisiting favorite recipes.",
    thumbnail: "/projects/lutoko-home.png",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    liveUrl: "https://luto-ko.vercel.app",
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
  {
    id: "project-5",
    title: "Lucky Idea",
    description:
      "A slot-machine idea generator: pull the lever to spin a domain, approach, and audience into one practical project idea, checked against similar builds.",
    thumbnail: "/projects/lucky-idea.svg",
    techStack: ["Expo", "React Native", "TypeScript", "Three.js", "Zustand", "OpenAI", "Exa"],
    repoUrl: "https://github.com/Drei010/Idea-Generator",
  },
];
