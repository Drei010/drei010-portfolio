# Andrei Kyle Hidalgo — Developer Portfolio

A tri-view developer portfolio built with Next.js, TypeScript, and Tailwind CSS: a web portfolio, an interactive CLI with an AI chatbot, and a Hill Climb Racing–style game mode.

## Features

- **Web View** — About, Services, Skills, Projects, and Contact sections.
- **CLI View** — Terminal-style commands with an AI-powered chatbot.
- **Game View** — Procedural terrain and vehicle physics built with Matter.js.

Game mode is a five-chapter journey through About, Services, Skills, Projects,
and Contact. Drive with the on-screen pedals or arrow/A/D keys. Discoveries stay
in Collection; project and contact cards use the same links as the web portfolio.
Use **Right car** to recover without losing discoveries. Runs reset on exit or replay.

The game loads only on entry, supports portrait and landscape, and stops drawing
while idle, complete, or backgrounded. Its canvas is capped at 2× density and three
million pixels. The preprocessed car sprite can be regenerated with
`node scripts/prepare-game-car.mjs` using the existing Sharp dependency.

## Tech Stack

Next.js (App Router) · TypeScript · React · Tailwind CSS · Matter.js · LangChain + Gemini · Vitest

## Getting Started

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site works fully without any API keys — the AI chatbot is optional and only activates once a Gemini key is added.

## Environment Configuration

Copy `.env.example` to `.env` and add your own Gemini API key to enable the AI chatbot:

```dotenv
GOOGLE_API_KEY=your-key-here
```

Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey). Never commit `.env` — it's gitignored and read only on the server, never exposed to the browser.

## Quality Checks

```bash
npm run check
```

Runs type checking, linting, tests, and a production build.

After a build, run `PLAYWRIGHT_PRODUCTION=1 npm run test:e2e` for the browser suite.
Game tests cover desktop Chromium/WebKit, iPhone and iPad in both orientations,
and mobile Chromium as an Android WebView approximation. Screenshots for ready,
discovery, rotated gameplay, and completion are saved in `test-results/`.
These are browser emulations; physical WKWebView host behavior still needs device testing.

Add your Gemini environment variables to the deployment project before enabling the AI chatbot in production.
