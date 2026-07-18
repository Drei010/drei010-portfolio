import { describe, expect, it } from "vitest";
import { executeCommand } from "@/lib/cli/commands";

describe("CLI chat routing", () => {
  it("keeps known commands ahead of chatbot routing", async () => {
    const result = await executeCommand("projects please");
    expect(result.chatRequest).toBeUndefined();
    expect(result.lines.some((line) =>
      line.segments.some((segment) => segment.text.includes("RAG Backend"))
    )).toBe(true);
  });

  it("returns prepared answers locally for explicit and natural questions", async () => {
    const explicit = await executeCommand("ask how can I contact you?");
    expect(explicit.chatRequest).toBeUndefined();
    expect(explicit.chatExchange?.question).toBe("how can I contact you?");

    const natural = await executeCommand("hello");
    expect(natural.chatRequest).toBeUndefined();
    expect(natural.chatExchange?.answer).toContain("Andrei Kyle Hidalgo");
  });

  it("routes conversational misses remotely but preserves typo errors", async () => {
    const explicit = await executeCommand("ask What motivates your work?");
    expect(explicit.chatRequest?.question).toBe("What motivates your work?");

    const natural = await executeCommand("Tell me more about your experience");
    expect(natural.chatRequest?.question).toBe(
      "Tell me more about your experience"
    );

    const typo = await executeCommand("skils");
    expect(typo.chatRequest).toBeUndefined();
    expect(typo.lines.some((line) =>
      line.segments.some((segment) => segment.text.includes("Command not found"))
    )).toBe(true);
  });
});
