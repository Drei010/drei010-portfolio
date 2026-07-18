import { CommandResult, TerminalLine } from "@/lib/types";
import { aboutData } from "@/lib/data/about";
import { skillsData } from "@/lib/data/skills";
import { projectsData } from "@/lib/data/projects";
import { contactData } from "@/lib/data/contact";
import { servicesData } from "@/lib/data/services";
import { findPreparedAnswer } from "@/lib/cli/ai-adapter";

function parseCommand(input: string): { name: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  const name = (parts[0] ?? "").toLowerCase();
  const args = parts.slice(1);
  return { name, args };
}

function makeLine(segments: TerminalLine["segments"]): TerminalLine;
function makeLine(text: string, color?: TerminalLine["segments"][0]["color"]): TerminalLine;
function makeLine(
  input: string | TerminalLine["segments"],
  color?: TerminalLine["segments"][0]["color"]
): TerminalLine {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    segments: typeof input === "string"
      ? [{ text: input, color: color ?? "default" }]
      : input,
  };
}

function makeChatResult(question: string): CommandResult {
  const preparedAnswer = findPreparedAnswer(question);
  if (!preparedAnswer) {
    return { lines: [], chatRequest: { question } };
  }

  return {
    lines: [
      makeLine(""),
      makeLine([{ text: preparedAnswer.response, color: "default" }]),
      makeLine(""),
    ],
    chatExchange: { question, answer: preparedAnswer.response },
  };
}

export function isConversationalInput(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.split(/\s+/).length > 1 || /[?？]$/.test(trimmed);
}

type CommandHandler = (args: string[]) => CommandResult | Promise<CommandResult>;

const commands: Record<string, CommandHandler> = {
  help: () => ({
    lines: [
      makeLine(""),
      makeLine([
        { text: "Available Commands:", color: "primary" },
      ]),
      makeLine(""),
      makeLine([
        { text: "  help        ", color: "prompt" },
        { text: "Show this help message", color: "muted" },
      ]),
      makeLine([
        { text: "  about       ", color: "prompt" },
        { text: "Learn about me", color: "muted" },
      ]),
      makeLine([
        { text: "  skills      ", color: "prompt" },
        { text: "View my tech stack", color: "muted" },
      ]),
      makeLine([
        { text: "  services    ", color: "prompt" },
        { text: "View services I offer", color: "muted" },
      ]),
      makeLine([
        { text: "  projects    ", color: "prompt" },
        { text: "Browse my projects", color: "muted" },
      ]),
      makeLine([
        { text: "  contact     ", color: "prompt" },
        { text: "Get my contact info", color: "muted" },
      ]),
      makeLine([
        { text: "  ask <query> ", color: "prompt" },
        { text: "Ask a portfolio question", color: "muted" },
      ]),
      makeLine([
        { text: "  <question>  ", color: "prompt" },
        { text: "Ask naturally without the ask command", color: "muted" },
      ]),
      makeLine([
        { text: "  Ctrl+C / Esc", color: "prompt" },
        { text: "  Cancel a streaming response", color: "muted" },
      ]),
      makeLine([
        { text: "  theme       ", color: "prompt" },
        { text: "Switch to web view", color: "muted" },
      ]),
      makeLine([
        { text: "  clear       ", color: "prompt" },
        { text: "Clear terminal and chat history", color: "muted" },
      ]),
      makeLine(""),
    ],
  }),

  about: () => ({
    lines: [
      makeLine(""),
      makeLine([
        { text: `${aboutData.name}`, color: "primary" },
      ]),
      makeLine([
        { text: aboutData.title, color: "prompt" },
      ]),
      makeLine(""),
      makeLine(aboutData.bio),
      makeLine(""),
      makeLine(""),
    ],
  }),

  skills: () => {
    const lines: TerminalLine[] = [makeLine("")];
    for (const category of skillsData) {
      lines.push(
        makeLine([
          { text: `[${category.name}]`, color: "primary" },
        ])
      );
      lines.push(
        makeLine([
          { text: `  ${category.skills.join(" • ")}`, color: "default" },
        ])
      );
      lines.push(makeLine(""));
    }
    return { lines };
  },

  services: () => {
    const lines: TerminalLine[] = [makeLine("")];
    for (const service of servicesData) {
      lines.push(
        makeLine([
          { text: `▸ ${service.title}`, color: "primary" },
        ])
      );
      lines.push(
        makeLine([
          { text: `  ${service.description}`, color: "muted" },
        ])
      );
      for (const highlight of service.highlights) {
        lines.push(
          makeLine([
            { text: `    • ${highlight}`, color: "default" },
          ])
        );
      }
      lines.push(makeLine(""));
    }
    return { lines };
  },

  projects: () => {
    const lines: TerminalLine[] = [makeLine("")];
    for (const project of projectsData) {
      lines.push(
        makeLine([
          { text: `▸ ${project.title}`, color: "primary" },
        ])
      );
      lines.push(
        makeLine([
          { text: `  ${project.description}`, color: "muted" },
        ])
      );
      lines.push(
        makeLine([
          { text: `  tech: `, color: "dim" },
          { text: project.techStack.join(", "), color: "default" },
        ])
      );
      if (project.liveUrl) {
        lines.push(
          makeLine([
            { text: `  live: `, color: "dim" },
            { text: project.liveUrl, color: "prompt" },
          ])
        );
      }
      if (project.repoUrl) {
        lines.push(
          makeLine([
            { text: `  repo: `, color: "dim" },
            { text: project.repoUrl, color: "prompt" },
          ])
        );
      }
      lines.push(makeLine(""));
    }
    return { lines };
  },

  contact: () => ({
    lines: [
      makeLine(""),
      makeLine([
        { text: "Get in touch:", color: "primary" },
      ]),
      makeLine(""),
      makeLine([
        { text: "  email: ", color: "dim" },
        { text: contactData.email, color: "prompt" },
      ]),
      ...contactData.links.map((link) =>
        makeLine([
          { text: `  ${link.platform.toLowerCase()}: `, color: "dim" },
          { text: link.url, color: "prompt" },
        ])
      ),
      makeLine(""),
    ],
  }),

  clear: () => ({
    lines: [],
    clear: true,
  }),

  theme: () => ({
    lines: [],
    switchView: "web" as const,
  }),

  ask: (args: string[]) => {
    const question = args.join(" ");
    if (!question) {
      return {
        lines: [
          makeLine(""),
          makeLine([
            { text: "Usage: ", color: "muted" },
            { text: "ask <your question>", color: "prompt" },
          ]),
          makeLine(""),
        ],
      };
    }

    return makeChatResult(question);
  },
};

export async function executeCommand(input: string): Promise<CommandResult> {
  const { name, args } = parseCommand(input);

  const handler = commands[name];
  if (!handler) {
    if (findPreparedAnswer(input) || isConversationalInput(input)) {
      return makeChatResult(input);
    }

    return {
      lines: [
        makeLine(""),
        makeLine([
          { text: `Command not found: `, color: "muted" },
          { text: name, color: "primary" },
        ]),
        makeLine([
          { text: `Type `, color: "muted" },
          { text: "help", color: "prompt" },
          { text: ` to see available commands.`, color: "muted" },
        ]),
        makeLine(""),
      ],
    };
  }

  return handler(args);
}
