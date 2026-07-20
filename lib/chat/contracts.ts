export const CHAT_LIMITS = {
  maxQuestionLength: 500,
  maxHistoryMessages: 12,
  maxHistoryMessageLength: 1_000,
  maxHistoryLength: 6_000,
} as const;

export type ChatRole = "user" | "assistant";

export type ChatHistoryMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  question: string;
  history: ChatHistoryMessage[];
};

export type ChatStreamEvent =
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; code: string; message: string };

export type ChatValidationResult =
  | { success: true; data: ChatRequest }
  | { success: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateChatRequest(value: unknown): ChatValidationResult {
  if (!isRecord(value)) {
    return { success: false, message: "Request body must be an object." };
  }

  if (typeof value.question !== "string") {
    return { success: false, message: "Question must be text." };
  }

  const question = value.question.trim();
  if (!question || question.length > CHAT_LIMITS.maxQuestionLength) {
    return {
      success: false,
      message: `Question must contain 1-${CHAT_LIMITS.maxQuestionLength} characters.`,
    };
  }

  if (!Array.isArray(value.history)) {
    return { success: false, message: "History must be an array." };
  }

  if (
    value.history.length > CHAT_LIMITS.maxHistoryMessages ||
    value.history.length % 2 !== 0
  ) {
    return {
      success: false,
      message: "History must contain complete, bounded user/assistant exchanges.",
    };
  }

  const history: ChatHistoryMessage[] = [];
  let totalHistoryLength = 0;

  for (const [index, candidate] of value.history.entries()) {
    if (!isRecord(candidate)) {
      return { success: false, message: "History contains an invalid message." };
    }

    const expectedRole: ChatRole = index % 2 === 0 ? "user" : "assistant";
    if (candidate.role !== expectedRole || typeof candidate.content !== "string") {
      return {
        success: false,
        message: "History roles must alternate between user and assistant.",
      };
    }

    const content = candidate.content.trim();
    if (!content || content.length > CHAT_LIMITS.maxHistoryMessageLength) {
      return {
        success: false,
        message: "History contains an empty or oversized message.",
      };
    }

    totalHistoryLength += content.length;
    if (totalHistoryLength > CHAT_LIMITS.maxHistoryLength) {
      return { success: false, message: "History is too large." };
    }

    history.push({ role: expectedRole, content });
  }

  return { success: true, data: { question, history } };
}

export function encodeChatStreamEvent(event: ChatStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}
