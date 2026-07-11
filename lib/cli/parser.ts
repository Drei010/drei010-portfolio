export type ParsedCommand = {
  name: string;
  args: string[];
};

export function parseCommand(input: string): ParsedCommand {
  const parts = input.trim().split(/\s+/);
  const name = (parts[0] ?? "").toLowerCase();
  const args = parts.slice(1);
  return { name, args };
}
