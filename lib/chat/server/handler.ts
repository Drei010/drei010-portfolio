import {
  encodeChatStreamEvent,
  validateChatRequest,
} from "@/lib/chat/contracts";
import type { ChatProvider } from "@/lib/chat/server/provider";
import type { RateLimitDecision } from "@/lib/chat/server/rate-limit";

const MAX_CHAT_BODY_BYTES = 32_768;

export type ChatHandlerDependencies = {
  buildContext: () => string;
  checkRateLimit: (request: Request) => Promise<RateLimitDecision>;
  createProvider: () => ChatProvider;
};

type JsonBodyResult =
  | { success: true; value: unknown }
  | { success: false; tooLarge: boolean };

function jsonError(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message } },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

function rateLimitHeaders(decision: RateLimitDecision): HeadersInit {
  return {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": String(decision.reset),
  };
}

async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CHAT_BODY_BYTES) {
    return { success: false, tooLarge: true };
  }
  if (!request.body) return { success: false, tooLarge: false };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalLength += value.byteLength;
      if (totalLength > MAX_CHAT_BODY_BYTES) {
        await reader.cancel();
        return { success: false, tooLarge: true };
      }
      chunks.push(value);
    }
  } catch {
    return { success: false, tooLarge: false };
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      success: true,
      value: JSON.parse(new TextDecoder().decode(bodyBytes)) as unknown,
    };
  } catch {
    return { success: false, tooLarge: false };
  }
}

export async function handleChatRequest(
  request: Request,
  dependencies: ChatHandlerDependencies
): Promise<Response> {
  const requestMediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (requestMediaType !== "application/json") {
    return jsonError(415, "unsupported_media_type", "Content-Type must be application/json.");
  }

  const body = await readJsonBody(request);
  if (!body.success) {
    return body.tooLarge
      ? jsonError(413, "request_too_large", "Request body is too large.")
      : jsonError(400, "invalid_json", "Request body must be valid JSON.");
  }

  const validation = validateChatRequest(body.value);
  if (!validation.success) {
    return jsonError(400, "invalid_request", validation.message);
  }

  let rateLimit: RateLimitDecision;
  try {
    rateLimit = await dependencies.checkRateLimit(request);
  } catch {
    return jsonError(
      503,
      "chat_unavailable",
      "Chat is not configured right now. Please try again later."
    );
  }

  if (!rateLimit.success) {
    const retryAfter = Math.max(
      1,
      Math.ceil((rateLimit.reset - Date.now()) / 1_000)
    );
    const response = jsonError(
      429,
      "rate_limited",
      "Too many AI questions. Please wait before trying again."
    );
    for (const [name, value] of Object.entries(rateLimitHeaders(rateLimit))) {
      response.headers.set(name, value);
    }
    response.headers.set("Retry-After", String(retryAfter));
    return response;
  }

  let provider: ChatProvider;
  try {
    provider = dependencies.createProvider();
  } catch {
    return jsonError(
      503,
      "chat_unavailable",
      "Chat is not configured right now. Please try again later."
    );
  }

  const abortController = new AbortController();
  const abort = () => abortController.abort();
  request.signal.addEventListener("abort", abort, { once: true });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emittedToken = false;
      try {
        for await (const text of provider.stream({
          question: validation.data.question,
          history: validation.data.history,
          context: dependencies.buildContext(),
          signal: abortController.signal,
        })) {
          if (abortController.signal.aborted) break;
          if (text) {
            emittedToken = true;
            controller.enqueue(encodeChatStreamEvent({ type: "token", text }));
          }
        }

        if (!abortController.signal.aborted) {
          controller.enqueue(
            emittedToken
              ? encodeChatStreamEvent({ type: "done" })
              : encodeChatStreamEvent({
                  type: "error",
                  code: "empty_response",
                  message: "The AI returned an empty response. Please try again.",
                })
          );
        }
      } catch {
        if (!abortController.signal.aborted) {
          controller.enqueue(
            encodeChatStreamEvent({
              type: "error",
              code: "provider_error",
              message: "The AI response was interrupted. Please try again.",
            })
          );
        }
      } finally {
        request.signal.removeEventListener("abort", abort);
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      abortController.abort();
      request.signal.removeEventListener("abort", abort);
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store, no-transform",
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...rateLimitHeaders(rateLimit),
    },
  });
}
