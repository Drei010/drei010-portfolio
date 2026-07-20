// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChatStreamEvent } from "@/lib/chat/contracts";
import { ChatClientError, requestChatStream } from "@/lib/chat/client";
import { Terminal } from "@/components/cli/Terminal";

vi.mock("@/lib/view-context", () => ({
  useView: () => ({ view: "cli", setView: vi.fn() }),
}));

vi.mock("@/lib/chat/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/chat/client")>(
    "@/lib/chat/client"
  );
  return { ...actual, requestChatStream: vi.fn() };
});

async function* completeStream(text: string): AsyncIterable<ChatStreamEvent> {
  yield { type: "token", text };
  yield { type: "done" };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Terminal chat", () => {
  it("renders prepared answers without requesting the API", async () => {
    const user = userEvent.setup();
    render(<Terminal />);

    await user.type(screen.getByLabelText("Terminal command input"), "hello{Enter}");

    expect(await screen.findByText(/Hey! I'm Andrei Kyle Hidalgo/)).toBeTruthy();
    expect(requestChatStream).not.toHaveBeenCalled();
  });

  it("updates one response progressively as stream tokens arrive", async () => {
    let releaseSecondToken: (() => void) | undefined;
    const secondToken = new Promise<void>((resolve) => {
      releaseSecondToken = resolve;
    });
    vi.mocked(requestChatStream).mockImplementation(async function* () {
      yield { type: "token", text: "First " };
      await secondToken;
      yield { type: "token", text: "second" };
      yield { type: "done" };
    });

    const user = userEvent.setup();
    render(<Terminal />);
    await user.type(
      screen.getByLabelText("Terminal command input"),
      "Tell me about your enterprise experience{Enter}"
    );

    expect(await screen.findByText("First")).toBeTruthy();
    expect(screen.queryByText("First second")).toBeNull();

    releaseSecondToken?.();
    expect(await screen.findByText("First second")).toBeTruthy();
    expect(screen.getByText("AI response complete.")).toBeTruthy();
  });

  it("includes prepared exchanges in history and clears them with clear", async () => {
    vi.mocked(requestChatStream).mockImplementation(() =>
      completeStream("Remote answer")
    );
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByLabelText("Terminal command input");

    await user.type(input, "hello{Enter}");
    await user.type(input, "Tell me something specific{Enter}");

    await waitFor(() => expect(requestChatStream).toHaveBeenCalledTimes(1));
    const firstRequest = vi.mocked(requestChatStream).mock.calls[0]?.[0];
    expect(firstRequest?.history).toHaveLength(2);
    expect(firstRequest?.history[0]).toMatchObject({ role: "user", content: "hello" });

    await user.type(input, "clear{Enter}");
    await user.type(input, "Tell me something else{Enter}");

    await waitFor(() => expect(requestChatStream).toHaveBeenCalledTimes(2));
    const secondRequest = vi.mocked(requestChatStream).mock.calls[1]?.[0];
    expect(secondRequest?.history).toEqual([]);
  });

  it("renders actionable classified provider errors", async () => {
    vi.mocked(requestChatStream).mockImplementation(async function* () {
      throw new ChatClientError(
        "The configured AI model is unavailable. Please update GEMINI_MODEL.",
        { code: "model_unavailable" }
      );
    });

    const user = userEvent.setup();
    render(<Terminal />);
    await user.type(
      screen.getByLabelText("Terminal command input"),
      "Tell me about an unknown detail{Enter}"
    );

    expect(
      await screen.findAllByText(
        "The configured AI model is unavailable. Please update GEMINI_MODEL."
      )
    ).toHaveLength(2);
    expect(screen.queryByText(/AI response was interrupted/i)).toBeNull();
  });

  it("uses a safe generic message for unknown stream failures", async () => {
    vi.mocked(requestChatStream).mockImplementation(async function* () {
      throw new Error("internal secret detail");
    });

    const user = userEvent.setup();
    render(<Terminal />);
    await user.type(
      screen.getByLabelText("Terminal command input"),
      "Tell me another unknown detail{Enter}"
    );

    expect(
      await screen.findAllByText("The AI response failed. Please try again.")
    ).toHaveLength(2);
    expect(screen.queryByText(/internal secret detail/i)).toBeNull();
    expect(screen.queryByText(/AI response was interrupted/i)).toBeNull();
  });

  it("cancels an active stream from the keyboard and marks partial output", async () => {
    vi.mocked(requestChatStream).mockImplementation(async function* (
      _request,
      options
    ) {
      yield { type: "token", text: "Partial answer" };
      await new Promise<void>((_resolve, reject) => {
        options.signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true }
        );
      });
    });

    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByLabelText("Terminal command input");
    await user.type(input, "Tell me about a unique experience{Enter}");
    expect(await screen.findByText("Partial answer")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(
      await screen.findByText(/Partial answer\s+\[Response cancelled\.\]/)
    ).toBeTruthy();
    await waitFor(() => expect(input).toHaveProperty("readOnly", false));
  });
});
