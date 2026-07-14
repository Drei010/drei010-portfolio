"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { OutputLine } from "@/components/cli/OutputLine";
import { CommandInput } from "@/components/cli/CommandInput";
import { TerminalLine } from "@/lib/types";
import { executeCommand } from "@/lib/cli/commands";
import { useCommandHistory } from "@/lib/cli/history";
import { getCompletion } from "@/lib/cli/autocomplete";
import { useView } from "@/lib/view-context";
import { ASCII_ART, ASCII_ART_MOBILE } from "@/lib/data/ascii-art";

function buildAsciiLines(art: string): TerminalLine[] {
  return art
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line, i) => ({
      id: `ascii-${i}`,
      centered: true,
      segments: [{ text: line, color: "primary" as const }],
    }));
}

const DESKTOP_ASCII_LINES = buildAsciiLines(ASCII_ART);
const MOBILE_ASCII_LINES = buildAsciiLines(ASCII_ART_MOBILE);

function getWelcomeLines(isMobile: boolean): TerminalLine[] {
  const asciiLines = isMobile ? MOBILE_ASCII_LINES : DESKTOP_ASCII_LINES;
  return [
    ...asciiLines,
    { id: "welcome-0", centered: true, segments: [{ text: "" }] },
    {
      id: "welcome-1",
      centered: true,
      segments: [
        { text: "╔══════════════════════════════════════╗", color: "primary" },
      ],
    },
    {
      id: "welcome-2",
      centered: true,
      segments: [
        { text: "║  ", color: "primary" },
        { text: "andrei@portfolio", color: "prompt" },
        { text: " ~ ", color: "dim" },
        { text: "v1.0.0", color: "muted" },
        { text: "       ║", color: "primary" },
      ],
    },
    {
      id: "welcome-3",
      centered: true,
      segments: [
        { text: "╚══════════════════════════════════════╝", color: "primary" },
      ],
    },
    { id: "welcome-4", centered: true, segments: [{ text: "" }] },
    {
      id: "welcome-5",
      centered: true,
      segments: [
        { text: "Welcome to my interactive portfolio.", color: "default" },
      ],
    },
    {
      id: "welcome-6",
      centered: true,
      segments: [
        { text: "Type ", color: "muted" },
        { text: "help", color: "primary" },
        { text: " to see available commands.", color: "muted" },
      ],
    },
    { id: "welcome-7", centered: true, segments: [{ text: "" }] },
  ];
}

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(() => {
    const mobile = typeof window !== "undefined" && window.innerWidth < 640;
    return getWelcomeLines(mobile);
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setView } = useView();
  const { add, navigateUp, navigateDown, resetNavigation } = useCommandHistory();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const handleSubmit = useCallback(
    async (command: string) => {
      const trimmed = command.trim();
      if (!trimmed) return;

      add(trimmed);
      resetNavigation();

      const commandLine: TerminalLine = {
        id: `cmd-${Date.now()}`,
        segments: [
          { text: "❯ ", color: "prompt" },
          { text: trimmed, color: "default" },
        ],
        isCommand: true,
      };

      const result = await executeCommand(trimmed);

      if (result.clear) {
        setLines([]);
      } else if (result.switchView) {
        setView(result.switchView);
      } else {
        setLines((prev) => [...prev, commandLine, ...result.lines]);
      }

      setInput("");
    },
    [add, resetNavigation, setView]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = navigateUp();
        if (prev !== null) setInput(prev);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = navigateDown();
        setInput(next ?? "");
      } else if (e.key === "Tab") {
        e.preventDefault();
        const completed = getCompletion(input);
        if (completed) setInput(completed);
      }
    },
    [input, navigateUp, navigateDown]
  );

  return (
    <div className="flex flex-1 flex-col content-center bg-terminal-bg font-mono text-sm">
      <div
        ref={scrollRef}
        className=" overflow-y-auto p-4 scrollbar-hidden"
        onClick={() => {
          const inputEl = document.querySelector<HTMLInputElement>(
            'input[aria-label="Terminal command input"]'
          );
          inputEl?.focus();
        }}
      >
        {lines.map((line) => (
          <OutputLine key={line.id} line={line} />
        ))}
      </div>
      <div className="border-t border-border/30 p-4">
        <CommandInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
