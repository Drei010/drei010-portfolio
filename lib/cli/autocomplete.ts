const COMMANDS = [
  "help",
  "about",
  "projects",
  "skills",
  "contact",
  "clear",
  "theme",
  "ask",
];

export function getCompletion(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const matches = COMMANDS.filter((cmd) => cmd.startsWith(trimmed));

  if (matches.length === 1) {
    return matches[0];
  }

  if (matches.length > 1) {
    // Find longest common prefix
    let prefix = matches[0];
    for (const match of matches) {
      while (!match.startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
      }
    }
    if (prefix.length > trimmed.length) {
      return prefix;
    }
  }

  return null;
}

export function getCompletionSuggestions(input: string): string[] {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return COMMANDS;
  return COMMANDS.filter((cmd) => cmd.startsWith(trimmed));
}
