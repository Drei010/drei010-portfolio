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
    <div
      className={`${
        line.centered ? "flex justify-center" : ""
      } ${line.isCommand ? "mt-2" : ""}`}
    >
      <div className="whitespace-pre-wrap break-words">
        {line.segments.map((segment, i) => (
          <span key={i} className={colorMap[segment.color ?? "default"]}>
            {segment.text}
          </span>
        ))}
        {line.isStreaming ? (
          <span className="animate-pulse text-terminal-prompt" aria-hidden="true">
            ▌
          </span>
        ) : null}
      </div>
    </div>
  );
}