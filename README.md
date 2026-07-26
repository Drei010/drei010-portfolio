# Andrei Kyle Hidalgo — Developer Portfolio

A tri-view developer portfolio built with Next.js, TypeScript, and Tailwind CSS: a web portfolio, an interactive CLI with an AI chatbot, and a Hill Climb Racing–style game mode.

## Features

- **Web View** — About, Services, Skills, Projects, and Contact sections.
- **CLI View** — Terminal-style commands with an AI-powered chatbot.
- **Game View** — Procedural terrain and vehicle physics built with Matter.js.

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

Add your Gemini environment variables to the deployment project before enabling the AI chatbot in production.

