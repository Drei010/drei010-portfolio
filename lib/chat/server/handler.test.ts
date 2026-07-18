import { describe, expect, it, vi } from "vitest";
import { handleChatRequest, type ChatHandlerDependencies } from "@/lib/chat/server/handler";
import type { ChatProvider, ChatProviderInput } from "@/lib/chat/server/provider";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDependencies(
  provider: ChatProvider,
  allowed = true
): ChatHandlerDependencies {
  return {
    buildContext: () => "TRUSTED PORTFOLIO CONTEXT",
    checkRateLimit: vi.fn(async () => ({
      success: allowed,
      limit: 10,
      remaining: allowed ? 9 : 0,
      reset: Date.now() + 60_000,
    })),
    createProvider: vi.fn(() => provider),
  };
}

describe("handleChatRequest", () => {
  it("rejects malformed and oversized requests before provider invocation", async () => {
    const provider: ChatProvider = {
      async *stream() {
        yield "unused";
      },
    };
    const dependencies = makeDependencies(provider);

    const malformedResponse = await handleChatRequest(
      makeRequest({ question: "", history: [] }),
      dependencies
    );
    expect(malformedResponse.status).toBe(400);

    const oversizedResponse = await handleChatRequest(
      makeRequest({ question: "x".repeat(501), history: [] }),
      dependencies
    );
    expect(oversizedResponse.status).toBe(400);

    const oversizedBodyResponse = await handleChatRequest(
      makeRequest({
        question: "Valid question",
        history: [],
        padding: "x".repeat(40_000),
      }),
      dependencies
    );
    expect(oversizedBodyResponse.status).toBe(413);
    expect(dependencies.createProvider).not.toHaveBeenCalled();
  });

  it("returns rate-limit metadata without invoking the provider", async () => {
    const provider: ChatProvider = {
      async *stream() {
        yield "unused";
      },
    };
    const dependencies = makeDependencies(provider, false);

    const response = await handleChatRequest(
      makeRequest({ question: "Tell me about your experience", history: [] }),
      dependencies
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBeTruthy();
    expect(response.headers.get("x-ratelimit-remaining")).toBe("0");
    expect(dependencies.createProvider).not.toHaveBeenCalled();
  });

  it("streams provider text as ordered NDJSON using trusted context", async () => {
    let receivedInput: ChatProviderInput | null = null;
    const provider: ChatProvider = {
      async *stream(input) {
        receivedInput = input;
        yield "Hello ";
        yield "Andrei 👋";
      },
    };
    const dependencies = makeDependencies(provider);

    const response = await handleChatRequest(
      makeRequest({
        question: "What do you build?",
        history: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi!" },
        ],
      }),
      dependencies
    );
    const events = (await response.text())
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as unknown);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/x-ndjson");
    expect(events).toEqual([
      { type: "token", text: "Hello " },
      { type: "token", text: "Andrei 👋" },
      { type: "done" },
    ]);
    expect(receivedInput).toMatchObject({
      question: "What do you build?",
      context: "TRUSTED PORTFOLIO CONTEXT",
    });
  });

  it("converts provider failures into a safe stream event", async () => {
    const provider: ChatProvider = {
      async *stream() {
        yield "Partial";
        throw new Error("secret provider detail");
      },
    };
    const response = await handleChatRequest(
      makeRequest({ question: "Tell me more", history: [] }),
      makeDependencies(provider)
    );
    const body = await response.text();

    expect(body).toContain('"type":"token"');
    expect(body).toContain('"type":"error"');
    expect(body).not.toContain("secret provider detail");
  });

  it("turns a zero-token provider completion into an error event", async () => {
    const provider: ChatProvider = {
      async *stream() {
        return;
      },
    };
    const response = await handleChatRequest(
      makeRequest({ question: "Tell me more", history: [] }),
      makeDependencies(provider)
    );
    const body = await response.text();

    expect(body).toContain('"code":"empty_response"');
    expect(body).not.toContain('"type":"done"');
  });
});
