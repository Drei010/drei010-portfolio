import { describe, expect, it } from "vitest";
import type { ChatRequest, ChatStreamEvent } from "@/lib/chat/contracts";
import {
  ChatClientError,
  requestChatStream,
  type ChatFetch,
} from "@/lib/chat/client";

function streamResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
    {
      status,
      headers: { "content-type": "application/x-ndjson" },
    }
  );
}

async function collectEvents(
  request: ChatRequest,
  fetcher: ChatFetch
): Promise<ChatStreamEvent[]> {
  const events: ChatStreamEvent[] = [];
  for await (const event of requestChatStream(request, {
    signal: new AbortController().signal,
    fetcher,
  })) {
    events.push(event);
  }
  return events;
}

describe("requestChatStream", () => {
  it("parses NDJSON split across chunks without corrupting Unicode", async () => {
    const payload =
      '{"type":"token","text":"Hello 👋"}\n{"type":"done"}\n';
    const bytes = new TextEncoder().encode(payload);
    const fetcher: ChatFetch = async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(bytes.slice(0, 30));
            controller.enqueue(bytes.slice(30, 36));
            controller.enqueue(bytes.slice(36));
            controller.close();
          },
        }),
        { headers: { "content-type": "application/x-ndjson" } }
      );

    await expect(
      collectEvents({ question: "Hello", history: [] }, fetcher)
    ).resolves.toEqual([
      { type: "token", text: "Hello 👋" },
      { type: "done" },
    ]);
  });

  it("maps HTTP and stream errors to safe typed client errors", async () => {
    const limitedFetch: ChatFetch = async () =>
      Response.json(
        { error: { code: "rate_limited", message: "Wait before trying again." } },
        { status: 429, headers: { "retry-after": "30" } }
      );

    await expect(
      collectEvents({ question: "Question", history: [] }, limitedFetch)
    ).rejects.toMatchObject({
      name: "ChatClientError",
      code: "rate_limited",
      retryAfter: 30,
    });

    const failedStream: ChatFetch = async () =>
      streamResponse([
        '{"type":"error","code":"provider_error","message":"Try again."}\n',
      ]);

    try {
      await collectEvents({ question: "Question", history: [] }, failedStream);
      throw new Error("Expected requestChatStream to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ChatClientError);
      expect(error).toMatchObject({ code: "provider_error", message: "Try again." });
    }
  });

  it("rejects malformed or incomplete streams", async () => {
    const malformedFetch: ChatFetch = async () =>
      streamResponse(['{"type":"unexpected"}\n']);
    await expect(
      collectEvents({ question: "Question", history: [] }, malformedFetch)
    ).rejects.toMatchObject({ code: "invalid_stream" });

    const incompleteFetch: ChatFetch = async () =>
      streamResponse(['{"type":"token","text":"partial"}\n']);
    await expect(
      collectEvents({ question: "Question", history: [] }, incompleteFetch)
    ).rejects.toMatchObject({ code: "incomplete_stream" });

    const extraFieldFetch: ChatFetch = async () =>
      streamResponse(['{"type":"done","extra":true}\n']);
    await expect(
      collectEvents({ question: "Question", history: [] }, extraFieldFetch)
    ).rejects.toMatchObject({ code: "invalid_stream" });

    const trailingEventFetch: ChatFetch = async () =>
      streamResponse([
        '{"type":"done"}\n{"type":"token","text":"late"}\n',
      ]);
    await expect(
      collectEvents({ question: "Question", history: [] }, trailingEventFetch)
    ).rejects.toMatchObject({ code: "invalid_stream" });

    const wrongMediaType: ChatFetch = async () =>
      new Response('{"type":"done"}\n', {
        headers: { "content-type": "text/plain" },
      });
    await expect(
      collectEvents({ question: "Question", history: [] }, wrongMediaType)
    ).rejects.toMatchObject({ code: "invalid_stream" });
  });
});
