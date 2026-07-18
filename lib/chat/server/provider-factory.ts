import "server-only";

import { GeminiChatProvider } from "@/lib/chat/server/gemini-provider";
import type { ChatProvider } from "@/lib/chat/server/provider";

export class ChatConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatConfigurationError";
  }
}

export function createChatProvider(
  environment: NodeJS.ProcessEnv = process.env
): ChatProvider {
  const provider = environment.CHAT_PROVIDER?.trim() || "gemini";

  if (provider !== "gemini") {
    throw new ChatConfigurationError(`Unsupported chat provider: ${provider}`);
  }

  const apiKey = environment.GOOGLE_API_KEY?.trim();
  if (!apiKey) {
    throw new ChatConfigurationError("GOOGLE_API_KEY is not configured.");
  }

  return new GeminiChatProvider({
    apiKey,
    model: environment.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
  });
}
