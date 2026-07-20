import { describe, expect, it, vi } from "vitest";
import {
  GeminiChatProvider,
  type GeminiStreamingModel,
} from "@/lib/chat/server/gemini-provider";
import { ChatProviderError } from "@/lib/chat/server/provider";

vi.mock("server-only", () => ({}));

const input = {
  question: "What has Andrei built?",
  history: [],
  context: "trusted context",
  signal: new AbortController().signal,
};

function makeProvider(model: GeminiStreamingModel): GeminiChatProvider {
  return new GeminiChatProvider(
    { apiKey: "test-key", model: "test-model" },
    model
  );
}

describe("GeminiChatProvider", () => {
  it("normalizes failures while creating the provider stream", async () => {
    const provider = makeProvider({
      async stream() {
        throw {
          statusCode: 503,
          message: "This model is currently experiencing high demand.",
        };
      },
    });

    let receivedError: unknown;
    try {
      for await (const _text of provider.stream(input)) {
        vi.fn()(_text);
      }
    } catch (error) {
      receivedError = error;
    }

    expect(receivedError).toBeInstanceOf(ChatProviderError);
    expect(receivedError).toMatchObject({ code: "provider_busy" });
  });

  it("normalizes failures raised during chunk iteration", async () => {
    const provider = makeProvider({
      async stream() {
        return (async function* () {
          yield { text: "Partial" };
          throw new Error("Model is not found for this API version.");
        })();
      },
    });
    const receivedText: string[] = [];
    let receivedError: unknown;

    try {
      for await (const text of provider.stream(input)) receivedText.push(text);
    } catch (error) {
      receivedError = error;
    }

    expect(receivedText).toEqual(["Partial"]);
    expect(receivedError).toBeInstanceOf(ChatProviderError);
    expect(receivedError).toMatchObject({ code: "model_unavailable" });
  });
});
