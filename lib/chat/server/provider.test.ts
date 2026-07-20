import { describe, expect, it } from "vitest";
import {
  ChatProviderError,
  normalizeChatProviderError,
} from "@/lib/chat/server/provider";

describe("normalizeChatProviderError", () => {
  it("classifies retired or missing models with an actionable safe message", () => {
    const error = normalizeChatProviderError(
      new Error(
        "This model models/gemini-2.5-flash is no longer available to new users."
      )
    );

    expect(error).toBeInstanceOf(ChatProviderError);
    expect(error).toMatchObject({
      code: "model_unavailable",
      clientMessage:
        "The configured AI model is unavailable. Please update GEMINI_MODEL.",
    });
  });

  it("classifies transient capacity errors as retryable provider failures", () => {
    const error = normalizeChatProviderError({
      statusCode: 503,
      message: "This model is currently experiencing high demand.",
    });

    expect(error).toMatchObject({
      code: "provider_busy",
      clientMessage:
        "The AI service is temporarily busy. Please try again shortly.",
    });
  });

  it("classifies rejected provider credentials without exposing details", () => {
    const error = normalizeChatProviderError({
      statusCode: 403,
      message: "Permission denied for secret project metadata.",
    });

    expect(error).toMatchObject({
      code: "provider_auth_error",
      clientMessage:
        "The AI provider credentials were rejected. Please check GOOGLE_API_KEY.",
    });
    expect(error.clientMessage).not.toContain("project metadata");
  });

  it("keeps unknown details behind the generic provider boundary", () => {
    const error = normalizeChatProviderError(
      new Error("internal provider secret detail")
    );

    expect(error).toMatchObject({
      code: "provider_error",
      clientMessage: "The AI response failed. Please try again.",
    });
    expect(error.clientMessage).not.toContain("secret");
  });
});
