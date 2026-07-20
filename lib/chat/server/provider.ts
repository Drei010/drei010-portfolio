import type { ChatHistoryMessage } from "@/lib/chat/contracts";

export type ChatProviderInput = {
  question: string;
  history: readonly ChatHistoryMessage[];
  context: string;
  signal: AbortSignal;
};

export interface ChatProvider {
  stream(input: ChatProviderInput): AsyncIterable<string>;
}

export type ChatProviderErrorCode =
  | "model_unavailable"
  | "provider_busy"
  | "provider_auth_error"
  | "provider_error";

export class ChatProviderError extends Error {
  readonly code: ChatProviderErrorCode;
  readonly clientMessage: string;

  constructor(code: ChatProviderErrorCode, clientMessage: string) {
    super(clientMessage);
    this.name = "ChatProviderError";
    this.code = code;
    this.clientMessage = clientMessage;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStatusCode(error: unknown): number | null {
  if (!isRecord(error)) return null;
  if (typeof error.statusCode === "number") return error.statusCode;
  if (typeof error.status === "number") return error.status;
  if (isRecord(error.response) && typeof error.response.status === "number") {
    return error.response.status;
  }
  return null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.toLowerCase();
  if (isRecord(error) && typeof error.message === "string") {
    return error.message.toLowerCase();
  }
  return "";
}

export function normalizeChatProviderError(error: unknown): ChatProviderError {
  if (error instanceof ChatProviderError) return error;

  const statusCode = getStatusCode(error);
  const message = getErrorMessage(error);

  if (
    statusCode === 404 ||
    message.includes("no longer available") ||
    message.includes("model is not found") ||
    message.includes("model not found") ||
    message.includes("unsupported model")
  ) {
    return new ChatProviderError(
      "model_unavailable",
      "The configured AI model is unavailable. Please update GEMINI_MODEL."
    );
  }

  if (
    statusCode === 429 ||
    (statusCode !== null && statusCode >= 500) ||
    message.includes("high demand") ||
    message.includes("resource exhausted") ||
    message.includes("temporarily unavailable")
  ) {
    return new ChatProviderError(
      "provider_busy",
      "The AI service is temporarily busy. Please try again shortly."
    );
  }

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    message.includes("api key not valid") ||
    message.includes("permission denied")
  ) {
    return new ChatProviderError(
      "provider_auth_error",
      "The AI provider credentials were rejected. Please check GOOGLE_API_KEY."
    );
  }

  return new ChatProviderError(
    "provider_error",
    "The AI response failed. Please try again."
  );
}
