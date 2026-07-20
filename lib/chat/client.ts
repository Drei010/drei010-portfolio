import type {
  ChatRequest,
  ChatStreamEvent,
} from "@/lib/chat/contracts";

export type ChatFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export type ChatStreamOptions = {
  signal: AbortSignal;
  fetcher?: ChatFetch;
};

export class ChatClientError extends Error {
  readonly code: string;
  readonly status: number | null;

  constructor(
    message: string,
    options: { code: string; status?: number }
  ) {
    super(message);
    this.name = "ChatClientError";
    this.code = options.code;
    this.status = options.status ?? null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[]
): boolean {
  const keys = Object.keys(value);
  return (
    keys.length === expectedKeys.length &&
    expectedKeys.every((key) => Object.hasOwn(value, key))
  );
}

function invalidStream(): ChatClientError {
  return new ChatClientError("The AI returned an invalid stream.", {
    code: "invalid_stream",
  });
}

function parseStreamEvent(line: string): ChatStreamEvent {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw invalidStream();
  }

  if (!isRecord(value) || typeof value.type !== "string") {
    throw invalidStream();
  }

  if (value.type === "done" && hasExactKeys(value, ["type"])) {
    return { type: "done" };
  }
  if (
    value.type === "token" &&
    hasExactKeys(value, ["type", "text"]) &&
    typeof value.text === "string"
  ) {
    return { type: "token", text: value.text };
  }
  if (
    value.type === "error" &&
    hasExactKeys(value, ["type", "code", "message"]) &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  ) {
    return { type: "error", code: value.code, message: value.message };
  }

  throw invalidStream();
}

async function readHttpError(response: Response): Promise<ChatClientError> {
  let code = "request_failed";
  let message = "Chat is unavailable right now. Please try again.";

  try {
    const body: unknown = await response.json();
    if (isRecord(body) && isRecord(body.error)) {
      if (typeof body.error.code === "string") code = body.error.code;
      if (typeof body.error.message === "string") message = body.error.message;
    }
  } catch {}

  return new ChatClientError(message, {
    code,
    status: response.status,
  });
}

export async function* requestChatStream(
  request: ChatRequest,
  options: ChatStreamOptions
): AsyncIterable<ChatStreamEvent> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) throw await readHttpError(response);
  const responseMediaType = response.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (responseMediaType !== "application/x-ndjson") {
    throw invalidStream();
  }
  if (!response.body) {
    throw new ChatClientError("The AI response stream was empty.", {
      code: "empty_stream",
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  let streamEnded = false;

  try {
    while (!streamEnded) {
      const result = await reader.read();
      streamEnded = result.done;
      buffer += decoder.decode(result.value, { stream: !streamEnded });

      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex >= 0) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        newlineIndex = buffer.indexOf("\n");
        if (!line) continue;
        if (completed) throw invalidStream();

        const event = parseStreamEvent(line);
        if (event.type === "error") {
          throw new ChatClientError(event.message, { code: event.code });
        }

        yield event;
        if (event.type === "done") completed = true;
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (buffer.trim()) throw invalidStream();
  if (!completed) {
    throw new ChatClientError("The AI response ended unexpectedly.", {
      code: "incomplete_stream",
    });
  }
}
