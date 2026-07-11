"use client";

import { TerminalLine, OutputSegment } from "@/lib/types";

type OutputLineProps = {
  line: TerminalLine;
};

const colorMap: Record<NonNullable<OutputSegment["color"]>, string> = {
  primary: "text-terminal-text",
  dim: "text-terminal-dim",
  prompt: "text-terminal-prompt",
  muted: "text-muted",
  default: "text-foreground",
};

export function OutputLine({ line }: OutputLineProps) {
  return (
    <div className={`whitespace-pre-wrap break-words ${line.isCommand ? "mt-2" : ""}`}>
      {line.segments.map((segment, i) => (
        <span key={i} className={colorMap[segment.color ?? "default"]}>
          {segment.text}
        </span>
      ))}
    </div>
  );
}
