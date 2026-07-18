import {
  CHAT_LIMITS,
  type ChatHistoryMessage,
} from "@/lib/chat/contracts";

function truncateContent(content: string, maximum: number): string {
  return content.trim().slice(0, maximum);
}

function getHistoryLength(history: readonly ChatHistoryMessage[]): number {
  return history.reduce((total, message) => total + message.content.length, 0);
}

export function appendChatExchange(
  history: readonly ChatHistoryMessage[],
  question: string,
  answer: string
): ChatHistoryMessage[] {
  const normalizedQuestion = truncateContent(
    question,
    CHAT_LIMITS.maxQuestionLength
  );
  const normalizedAnswer = truncateContent(
    answer,
    CHAT_LIMITS.maxHistoryMessageLength
  );
  if (!normalizedQuestion || !normalizedAnswer) return [...history];

  const newExchange: ChatHistoryMessage[] = [
    { role: "user", content: normalizedQuestion },
    { role: "assistant", content: normalizedAnswer },
  ];
  const nextHistory: ChatHistoryMessage[] = [
    ...history,
    ...newExchange,
  ].slice(-CHAT_LIMITS.maxHistoryMessages);

  while (
    nextHistory.length >= 2 &&
    getHistoryLength(nextHistory) > CHAT_LIMITS.maxHistoryLength
  ) {
    nextHistory.splice(0, 2);
  }

  return nextHistory;
}
