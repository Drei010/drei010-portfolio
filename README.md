# Andrei Kyle Hidalgo — Developer Portfolio

A tri-view developer portfolio built with Next.js, TypeScript, and Tailwind CSS. It combines a minimalist web portfolio, an interactive CLI with a local-first Gemini chatbot, and a Hill Climb Racing game mode.

## Features

- **Web View** — Responsive About, Services, Skills, Projects, and Contact sections.
- **CLI View** — Terminal commands, history, tab completion, prepared portfolio answers, contextual AI follow-ups, and live token streaming.
- **Game View** — Procedural terrain, collectible portfolio items, and Matter.js vehicle physics.
- **Local-first chat** — Curated answers are resolved in the browser before any AI request is made.
- **Provider-neutral AI** — Gemini is isolated behind a server-side streaming provider contract so another provider can be added later.
- **Production safeguards** — Strict request bounds, portfolio-only context, explicit Gemini safety settings, no model tools, and durable Upstash rate limiting.
- **Accessible interaction** — Keyboard and touch support, reduced-motion handling, stream status announcements, and cancellable AI output.

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript in strict mode
- **UI:** React 19, Tailwind CSS v4, Motion
- **AI:** LangChain `@langchain/google` with Gemini
- **Rate limiting:** Upstash Redis and Upstash Rate Limit
- **Game physics:** Matter.js and HTML5 Canvas
- **Testing:** Vitest, Testing Library, jsdom, and repository-specific Node checks

## Getting Started

Requirements: Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The prepared CLI answers work without external credentials. Gemini fallback requests return a safe configuration error until both Gemini and Upstash are configured.

## Environment Configuration

The repository includes a secret-free `.env.example`; local `.env*` files remain ignored. Never prefix these values with `NEXT_PUBLIC_` or commit real credentials.

```dotenv
CHAT_PROVIDER=gemini
GOOGLE_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

| Variable | Purpose |
| --- | --- |
| `CHAT_PROVIDER` | Provider selected by the server factory. Currently accepts `gemini`. |
| `GOOGLE_API_KEY` | Server-only Gemini API key from Google AI Studio. |
| `GEMINI_MODEL` | Gemini model ID. The template uses `gemini-2.5-flash`; change it without modifying UI code. |
| `UPSTASH_REDIS_REST_URL` | REST URL for the Upstash Redis database. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only REST token for that database. |

### Configure Gemini

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create an API key for the intended Google project.
3. Set `GOOGLE_API_KEY` in `.env` locally and in the deployment environment.
4. Confirm that `GEMINI_MODEL` is available to that project.

### Configure Upstash

1. Create a Redis database in the [Upstash Console](https://console.upstash.com/redis).
2. Copy its REST URL and REST token into the two `UPSTASH_REDIS_*` variables.
3. Add the same variables to the deployment environment.

The chat endpoint uses a Redis-backed sliding window of 10 AI fallback requests per 10 minutes per hashed client IP. Prepared answers do not call the endpoint and do not consume this quota.

## Using the CLI Chatbot

Use explicit `ask` syntax or type a natural multi-word question:

```text
ask What projects have you built?
What experience do you have with AI?
hello
```

Resolution order:

1. Exact CLI commands such as `projects`, `skills`, or `contact` take priority.
2. The deterministic matcher checks prepared aliases and whole-word keywords.
3. Unknown single-word input such as `skils` remains a command error.
4. An unmatched explicit or conversational question is sent to `/api/chat` with bounded session history.
5. Gemini tokens stream into one stable terminal line as they arrive.

Chat history exists only in memory for the current CLI session. `clear` resets both terminal output and chat history; refresh also starts a new session. Press `Ctrl+C`, `Cmd+C`, or `Escape` to cancel an active response.

## Chat Architecture

```text
CLI input
  ├─ known command ───────────────> local command output
  └─ question
       ├─ prepared match ─────────> local answer, no quota use
       └─ miss ───────────────────> POST /api/chat
                                      ├─ validation and bounds
                                      ├─ Upstash rate limit
                                      ├─ trusted portfolio context
                                      ├─ ChatProvider factory
                                      └─ Gemini NDJSON token stream
```

Shared contracts live in `lib/chat/contracts.ts`. The browser parser in `lib/chat/client.ts` consumes newline-delimited events:

- `{ "type": "token", "text": "..." }`
- `{ "type": "done" }`
- `{ "type": "error", "code": "...", "message": "..." }`

The API and UI depend on `ChatProvider`, not Gemini-specific types. `GeminiChatProvider` is the only LangChain/Google adapter.

## Customizing Prepared Answers

Edit `lib/data/cli-answers.ts`. Each typed entry defines:

- a stable intent ID;
- exact normalized aliases;
- whole-word keywords and a minimum match count;
- deterministic priority;
- the displayed response.

Factual answers derive values from the canonical files in `lib/data/` where possible. The matcher normalizes case, Unicode marks, punctuation, and whitespace and does not perform substring matching.

## Adding Another AI Provider

1. Implement `ChatProvider` from `lib/chat/server/provider.ts` in a server-only module.
2. Convert provider chunks into plain text from its `stream()` async iterable.
3. Add the provider to `lib/chat/server/provider-factory.ts` and introduce only server-side environment variables.
4. Keep provider errors behind the existing safe NDJSON error contract.
5. Add contract tests with a fake provider; do not make live provider calls in CI.

No terminal, command-routing, session-history, or API protocol changes should be necessary.

## Security Model

- Gemini credentials and Upstash tokens are read only by server modules.
- The model receives only public data assembled from canonical portfolio files.
- User questions and history are untrusted, separately role-tagged, and strictly bounded.
- The system prompt requires portfolio-only answers and missing-information declines.
- Gemini safety filters are explicitly enabled for harassment, hate speech, sexual content, and dangerous content.
- Tools, code execution, web search, URL retrieval, filesystem access, and autonomous actions are not enabled.
- Client IP values are SHA-256 hashed before use as Upstash identifiers.
- Model text is rendered by React as plain text; it is never interpreted as HTML.
- Provider errors, prompts, stack traces, and credentials are not returned to clients.
- Prompt-injection defenses reduce exposure but cannot guarantee model compliance; keep the model least-privileged and test adversarial inputs when prompts or providers change.

## Project Structure

```text
├── app/
│   └── api/chat/                 # Validated streamed chat route
├── components/
│   ├── cli/                      # Terminal input and streamed output UI
│   ├── game/                     # Game canvas, controls, and HUD
│   └── web/                      # Portfolio sections
├── lib/
│   ├── chat/                     # Shared contracts, client parser, session helpers
│   │   └── server/               # Context, providers, limiter, and handler
│   ├── cli/                      # Commands, matching, autocomplete, history
│   ├── data/                     # Canonical portfolio and prepared-answer data
│   └── game/                     # Physics, terrain, rendering, and state
├── scripts/                      # Repository and physics checks
└── public/                       # Static assets
```

## Quality Checks

Run the same aggregate validation used before a pull request:

```bash
npm run check
```

Individual commands:

```bash
npm run typecheck
npm run lint
npm run test:repo
npm run test:physics
npm run test:chat
npm run build
```

`test:chat` covers prepared routing, strict API validation, rate-limit rejection, Unicode-safe NDJSON parsing, progressive terminal rendering, safe provider failures, and session reset behavior. Real Gemini and Upstash calls are intentionally excluded from automated tests.

## Troubleshooting

- **“Chat is not configured”** — Confirm all four Gemini/Upstash credential variables are non-empty and restart the development server.
- **Prepared answers work but AI questions fail** — This is expected when external credentials are absent; local matching bypasses the API.
- **HTTP 429** — Wait for the `Retry-After` period. Adjust the limiter in `lib/chat/server/rate-limit.ts` only after reviewing cost exposure.
- **Model unavailable** — Verify `GEMINI_MODEL` against the models enabled for the Google project.
- **Stream interrupted** — Retry after checking network connectivity and provider status. Partial responses are not added to session history.
- **Build succeeds without credentials** — Expected. Providers and the limiter initialize lazily on requests rather than at build time.

## Interaction and Accessibility Support

- Game mode supports keyboard and coarse-pointer/touch controls.
- Interrupted input is cleared on cancellation, blur, visibility loss, navigation, and unmount where applicable.
- Motion respects `prefers-reduced-motion`.
- Dialogs trap and restore focus and lock the portfolio scroll area.
- CLI streaming keeps the input focusable for cancellation and announces completion/errors without announcing every token.
- The target is WCAG 2.2 AA for keyboard, focus, form-error, and reduced-motion behavior.

## Game Physics Changes

Changes to vehicle dimensions, forces, suspension, collectibles, fixed stepping, or render transforms must update canonical values in `lib/game/config.ts` and pass `npm run test:physics`. Do not duplicate tuning values in renderers or tests.

## Deploy

```bash
npx vercel
```

Add every server-only environment variable to the deployment project before enabling public AI fallback. Do not expose or commit `.env`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andreikylehidalgo/portfolio)
