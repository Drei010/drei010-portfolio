import { describe, expect, it, vi } from "vitest";
import {
  handleChatRequest,
  type ChatHandlerDependencies,
} from "@/lib/chat/server/handler";
import {
  ChatProviderError,
  type ChatProvider,
  type ChatProviderInput,
} from "@/lib/chat/server/provider";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDependencies(provider: ChatProvider): ChatHandlerDependencies {
  return {
    buildContext: () => "TRUSTED PORTFOLIO CONTEXT",
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

  it("returns a safe configuration error without exposing provider details", async () => {
    const dependencies: ChatHandlerDependencies = {
      buildContext: () => "TRUSTED PORTFOLIO CONTEXT",
      createProvider: vi.fn(() => {
        throw new Error("secret provider configuration detail");
      }),
    };

    const response = await handleChatRequest(
      makeRequest({ question: "Tell me about your experience", history: [] }),
      dependencies
    );
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).toContain("chat_unavailable");
    expect(body).not.toContain("secret provider configuration detail");
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
    expect(response.headers.get("content-type")).toContain(
      "application/x-ndjson"
    );
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
    expect(body).toContain('"code":"provider_error"');
    expect(body).toContain("The AI response failed. Please try again.");
    expect(body).not.toContain("secret provider detail");
  });

  it("preserves actionable safe provider classifications", async () => {
    const provider: ChatProvider = {
      async *stream() {
        throw new ChatProviderError(
          "model_unavailable",
          "The configured AI model is unavailable. Please update GEMINI_MODEL."
        );
      },
    };
    const response = await handleChatRequest(
      makeRequest({ question: "Tell me more", history: [] }),
      makeDependencies(provider)
    );
    const body = await response.text();

    expect(body).toContain('"code":"model_unavailable"');
    expect(body).toContain("Please update GEMINI_MODEL.");
    expect(body).not.toContain("interrupted");
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
