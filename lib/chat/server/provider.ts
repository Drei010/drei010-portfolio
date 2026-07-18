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
