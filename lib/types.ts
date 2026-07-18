export type ViewMode = "web" | "cli" | "game";

export type ThemeMode = "light" | "dark";

export type SkillCategory = {
  name: string;
  skills: string[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
};

export type ContactLink = {
  platform: string;
  url: string;
  label: string;
};

export type AboutData = {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
};

export type ContactData = {
  email: string;
  links: ContactLink[];
};

export type OutputSegment = {
  text: string;
  color?: "primary" | "dim" | "prompt" | "muted" | "default";
};

export type TerminalLine = {
  id: string;
  segments: OutputSegment[];
  isCommand?: boolean;
  centered?: boolean;
};

export type CommandResult = {
  lines: TerminalLine[];
  clear?: boolean;
  switchView?: ViewMode;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  highlights: string[];
};
