"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { OutputLine } from "@/components/cli/OutputLine";
import { CommandInput } from "@/components/cli/CommandInput";
import type { ChatHistoryMessage } from "@/lib/chat/contracts";
import { ChatClientError, requestChatStream } from "@/lib/chat/client";
import { appendChatExchange } from "@/lib/chat/session";
import { executeCommand } from "@/lib/cli/commands";
import { useCommandHistory } from "@/lib/cli/history";
import { getCompletion } from "@/lib/cli/autocomplete";
import { useView } from "@/lib/view-context";
import type { TerminalLine } from "@/lib/types";
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

function getChatErrorMessage(error: unknown): string {
  if (error instanceof ChatClientError) {
    if (error.code === "rate_limited" && error.retryAfter) {
      return `${error.message} Try again in about ${error.retryAfter} seconds.`;
    }
    return error.message;
  }
  return "The AI response was interrupted. Please try again.";
}

function updateTerminalLine(
  lines: readonly TerminalLine[],
  id: string,
  text: string,
  isStreaming: boolean
): TerminalLine[] {
  return lines.map((line) =>
    line.id === id
      ? {
          ...line,
          isStreaming,
          segments: [{ text, color: "default" }],
        }
      : line
  );
}

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(() => {
    const mobile = typeof window !== "undefined" && window.innerWidth < 640;
    return getWelcomeLines(mobile);
  });
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const submittingRef = useRef(false);
  const activeRequestRef = useRef<AbortController | null>(null);
  const chatHistoryRef = useRef<ChatHistoryMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { view, setView } = useView();
  const { add, navigateUp, navigateDown, resetNavigation } = useCommandHistory();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    if (view !== "cli") activeRequestRef.current?.abort();
  }, [view]);

  useEffect(() => {
    return () => activeRequestRef.current?.abort();
  }, []);

  const streamChatResponse = useCallback(async (question: string) => {
    const responseId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const spacerId = `chat-space-${Date.now()}`;
    const abortController = new AbortController();
    activeRequestRef.current = abortController;
    let accumulatedResponse = "";
    let completed = false;

    setLines((previous) => [
      ...previous,
      { id: spacerId, segments: [{ text: "" }] },
      {
        id: responseId,
        segments: [{ text: "", color: "default" }],
        isStreaming: true,
      },
    ]);
    setAnnouncement("AI response started.");

    try {
      for await (const event of requestChatStream(
        { question, history: chatHistoryRef.current },
        { signal: abortController.signal }
      )) {
        if (event.type === "token") {
          accumulatedResponse += event.text;
          setLines((previous) =>
            updateTerminalLine(previous, responseId, accumulatedResponse, true)
          );
        } else if (event.type === "done") {
          completed = true;
        }
      }

      if (completed && !accumulatedResponse.trim()) {
        throw new ChatClientError("The AI returned an empty response. Please try again.", {
          code: "empty_response",
        });
      }

      if (completed) {
        setLines((previous) => [
          ...updateTerminalLine(
            previous,
            responseId,
            accumulatedResponse,
            false
          ),
          { id: `${responseId}-space`, segments: [{ text: "" }] },
        ]);
        chatHistoryRef.current = appendChatExchange(
          chatHistoryRef.current,
          question,
          accumulatedResponse
        );
        setAnnouncement("AI response complete.");
      }
    } catch (error) {
      const cancelled = abortController.signal.aborted;
      const message = cancelled
        ? "Response cancelled."
        : getChatErrorMessage(error);
      const displayText = accumulatedResponse
        ? `${accumulatedResponse}\n[${message}]`
        : message;

      setLines((previous) => [
        ...updateTerminalLine(previous, responseId, displayText, false),
        { id: `${responseId}-space`, segments: [{ text: "" }] },
      ]);
      setAnnouncement(message);
    } finally {
      if (activeRequestRef.current === abortController) {
        activeRequestRef.current = null;
      }
    }
  }, []);

  const handleSubmit = useCallback(
    async (command: string) => {
      const trimmed = command.trim();
      if (!trimmed || submittingRef.current) return;

      submittingRef.current = true;
      add(trimmed);
      resetNavigation();
      setInput("");
      setIsSubmitting(true);

      const commandLine: TerminalLine = {
        id: `cmd-${Date.now()}`,
        segments: [
          { text: "❯ ", color: "prompt" },
          { text: trimmed, color: "default" },
        ],
        isCommand: true,
      };
      setLines((previous) => [...previous, commandLine]);

      try {
        const result = await executeCommand(trimmed);
        if (result.clear) {
          activeRequestRef.current?.abort();
          chatHistoryRef.current = [];
          setLines([]);
          setAnnouncement("Terminal and chat history cleared.");
        } else if (result.switchView) {
          activeRequestRef.current?.abort();
          setView(result.switchView);
        } else {
          if (result.lines.length > 0) {
            setLines((previous) => [...previous, ...result.lines]);
          }
          if (result.chatExchange) {
            chatHistoryRef.current = appendChatExchange(
              chatHistoryRef.current,
              result.chatExchange.question,
              result.chatExchange.answer
            );
            setAnnouncement("Prepared answer displayed.");
          } else if (result.chatRequest) {
            await streamChatResponse(result.chatRequest.question);
          }
        }
      } catch {
        setLines((previous) => [
          ...previous,
          {
            id: `error-${Date.now()}`,
            segments: [
              {
                text: "Command failed. Please try again.",
                color: "primary",
              },
            ],
          },
        ]);
        setAnnouncement("Command failed. Please try again.");
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [add, resetNavigation, setView, streamChatResponse]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const isCancelKey =
        event.key === "Escape" ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c");
      if (isCancelKey && activeRequestRef.current) {
        event.preventDefault();
        activeRequestRef.current.abort();
        return;
      }
      if (submittingRef.current) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const previous = navigateUp();
        if (previous !== null) setInput(previous);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = navigateDown();
        setInput(next ?? "");
      } else if (event.key === "Tab") {
        event.preventDefault();
        const completed = getCompletion(input);
        if (completed) setInput(completed);
      }
    },
    [input, navigateUp, navigateDown]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-terminal-bg font-mono text-sm">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-hidden"
        aria-busy={isSubmitting}
        onClick={() => {
          const inputElement = document.querySelector<HTMLInputElement>(
            'input[aria-label="Terminal command input"]'
          );
          inputElement?.focus();
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
          busy={isSubmitting}
        />
      </div>
    </div>
  );
}
