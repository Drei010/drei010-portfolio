import { describe, expect, it } from "vitest";
import {
  CHAT_LIMITS,
  validateChatRequest,
  type ChatHistoryMessage,
} from "@/lib/chat/contracts";
import { appendChatExchange } from "@/lib/chat/session";

describe("appendChatExchange", () => {
  it("retains only the newest complete bounded exchanges", () => {
    let history: ChatHistoryMessage[] = [];
    for (let index = 0; index < 8; index += 1) {
      history = appendChatExchange(history, `question ${index}`, `answer ${index}`);
    }

    expect(history).toHaveLength(CHAT_LIMITS.maxHistoryMessages);
    expect(history[0]).toEqual({ role: "user", content: "question 2" });
    expect(history.at(-1)).toEqual({ role: "assistant", content: "answer 7" });
  });

  it("truncates content to the shared request bounds", () => {
    const history = appendChatExchange([], "q".repeat(800), "a".repeat(1_500));

    expect(history[0]?.content).toHaveLength(CHAT_LIMITS.maxQuestionLength);
    expect(history[1]?.content).toHaveLength(
      CHAT_LIMITS.maxHistoryMessageLength
    );
  });

  it("always returns server-valid history and ignores empty exchanges", () => {
    let history: ChatHistoryMessage[] = [];
    for (let index = 0; index < 8; index += 1) {
      history = appendChatExchange(
        history,
        `q${index}${"q".repeat(700)}`,
        `a${index}${"a".repeat(1_200)}`
      );
    }

    expect(
      validateChatRequest({ question: "next question", history })
    ).toMatchObject({ success: true });
    expect(history.length % 2).toBe(0);
    expect(appendChatExchange(history, "question", "   ")).toEqual(history);
  });
});
