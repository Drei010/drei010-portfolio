import { CommandResult, TerminalLine } from "@/lib/types";
import { parseCommand } from "@/lib/cli/parser";
import { aboutData } from "@/lib/data/about";
import { skillsData } from "@/lib/data/skills";
import { projectsData } from "@/lib/data/projects";
import { contactData } from "@/lib/data/contact";
import { servicesData } from "@/lib/data/services";
import { queryAI } from "@/lib/cli/ai-adapter";

function makeLine(text: string, color?: TerminalLine["segments"][0]["color"]): TerminalLine {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    segments: [{ text, color: color ?? "default" }],
  };
}

function makeMultiSegmentLine(
  segments: TerminalLine["segments"]
): TerminalLine {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    segments,
  };
}

type CommandHandler = (args: string[]) => CommandResult | Promise<CommandResult>;

const commands: Record<string, CommandHandler> = {
  help: () => ({
    lines: [
      makeLine(""),
      makeMultiSegmentLine([
        { text: "Available Commands:", color: "primary" },
      ]),
      makeLine(""),
      makeMultiSegmentLine([
        { text: "  help        ", color: "prompt" },
        { text: "Show this help message", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  about       ", color: "prompt" },
        { text: "Learn about me", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  skills      ", color: "prompt" },
        { text: "View my tech stack", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  services    ", color: "prompt" },
        { text: "View services I offer", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  projects    ", color: "prompt" },
        { text: "Browse my projects", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  contact     ", color: "prompt" },
        { text: "Get my contact info", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  ask <query> ", color: "prompt" },
        { text: "Ask me anything", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  theme       ", color: "prompt" },
        { text: "Switch to web view", color: "muted" },
      ]),
      makeMultiSegmentLine([
        { text: "  clear       ", color: "prompt" },
        { text: "Clear the terminal", color: "muted" },
      ]),
      makeLine(""),
    ],
  }),

  about: () => ({
    lines: [
      makeLine(""),
      makeMultiSegmentLine([
        { text: `${aboutData.name}`, color: "primary" },
      ]),
      makeMultiSegmentLine([
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
        makeMultiSegmentLine([
          { text: `[${category.name}]`, color: "primary" },
        ])
      );
      lines.push(
        makeMultiSegmentLine([
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
        makeMultiSegmentLine([
          { text: `▸ ${service.title}`, color: "primary" },
        ])
      );
      lines.push(
        makeMultiSegmentLine([
          { text: `  ${service.description}`, color: "muted" },
        ])
      );
      for (const highlight of service.highlights) {
        lines.push(
          makeMultiSegmentLine([
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
        makeMultiSegmentLine([
          { text: `▸ ${project.title}`, color: "primary" },
        ])
      );
      lines.push(
        makeMultiSegmentLine([
          { text: `  ${project.description}`, color: "muted" },
        ])
      );
      lines.push(
        makeMultiSegmentLine([
          { text: `  tech: `, color: "dim" },
          { text: project.techStack.join(", "), color: "default" },
        ])
      );
      if (project.liveUrl) {
        lines.push(
          makeMultiSegmentLine([
            { text: `  live: `, color: "dim" },
            { text: project.liveUrl, color: "prompt" },
          ])
        );
      }
      if (project.repoUrl) {
        lines.push(
          makeMultiSegmentLine([
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
      makeMultiSegmentLine([
        { text: "Get in touch:", color: "primary" },
      ]),
      makeLine(""),
      makeMultiSegmentLine([
        { text: "  email: ", color: "dim" },
        { text: contactData.email, color: "prompt" },
      ]),
      ...contactData.links.map((link) =>
        makeMultiSegmentLine([
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

  ask: async (args: string[]) => {
    const question = args.join(" ");
    if (!question) {
      return {
        lines: [
          makeLine(""),
          makeMultiSegmentLine([
            { text: "Usage: ", color: "muted" },
            { text: "ask <your question>", color: "prompt" },
          ]),
          makeLine(""),
        ],
      };
    }
    const response = await queryAI(question);
    return {
      lines: [
        makeLine(""),
        makeMultiSegmentLine([{ text: response, color: "default" }]),
        makeLine(""),
      ],
    };
  },
};

export async function executeCommand(input: string): Promise<CommandResult> {
  const { name, args } = parseCommand(input);

  const handler = commands[name];
  if (!handler) {
    return {
      lines: [
        makeLine(""),
        makeMultiSegmentLine([
          { text: `Command not found: `, color: "muted" },
          { text: name, color: "primary" },
        ]),
        makeMultiSegmentLine([
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
