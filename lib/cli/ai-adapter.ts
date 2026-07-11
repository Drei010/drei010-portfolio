/**
 * AI Adapter Interface
 *
 * This module defines the adapter pattern for AI-powered responses in the CLI.
 * Currently uses a StaticAdapter with keyword-matching responses.
 *
 * To connect your RAG backend:
 * 1. Implement the AIAdapter interface with your API client
 * 2. Replace the `activeAdapter` export with your implementation
 *
 * Example:
 *   class RAGAdapter implements AIAdapter {
 *     async query(input: string): Promise<string> {
 *       const res = await fetch('/api/rag', { method: 'POST', body: JSON.stringify({ input }) });
 *       const data = await res.json();
 *       return data.answer;
 *     }
 *   }
 */

export interface AIAdapter {
  query(input: string): Promise<string>;
}

class StaticAdapter implements AIAdapter {
  private responses: Array<{ keywords: string[]; response: string }> = [
    {
      keywords: ["tech", "stack", "use", "technology", "tools"],
      response:
        "I primarily work with TypeScript, React, Next.js, and Node.js. For styling I use Tailwind CSS. On the backend, I work with Python, PostgreSQL, and AWS services. I'm also experienced with Docker, CI/CD pipelines, and system design.",
    },
    {
      keywords: ["project", "work", "built", "build", "portfolio"],
      response:
        "I've built e-commerce platforms, AI chat applications, task management systems, and this interactive portfolio. Type 'projects' to see the full list with details.",
    },
    {
      keywords: ["contact", "hire", "email", "reach", "available"],
      response:
        "I'm open to opportunities! You can reach me at hello@andreikyle.dev or find me on GitHub and LinkedIn. Type 'contact' for all my links.",
    },
    {
      keywords: ["hello", "hi", "hey", "who", "name", "about"],
      response:
        "Hey! I'm Andrei Kyle Hidalgo, a full-stack developer based in the Philippines. I build modern web apps with a focus on clean architecture and great UX. Type 'about' for more.",
    },
    {
      keywords: ["skill", "good", "best", "strength"],
      response:
        "My strengths are in TypeScript/React for frontend, Node.js/Python for backend, and AWS for infrastructure. I enjoy building scalable systems and mentoring others. Type 'skills' for the complete list.",
    },
  ];

  async query(input: string): Promise<string> {
    const lower = input.toLowerCase();

    for (const entry of this.responses) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return entry.response;
      }
    }

    return "I don't have a specific answer for that yet. Try asking about my tech stack, projects, or how to contact me. Or type 'help' to see all commands.";
  }
}

const activeAdapter: AIAdapter = new StaticAdapter();

export async function queryAI(input: string): Promise<string> {
  return activeAdapter.query(input);
}
