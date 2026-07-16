# Andrei Kyle Hidalgo — Developer Portfolio

A tri-view developer portfolio built with Next.js, TypeScript, and Tailwind CSS — featuring a minimalist web view, an interactive CLI terminal, and a Hill Climb Racing game mode.

## Features

- **Web View** — Responsive portfolio with About, Services, Skills, Projects, and Contact sections.
- **CLI View** — Orange-on-black terminal with command history, tab completion, and AI-powered responses.
- **Game View** — 2D Hill Climb Racing game with procedural terrain, collectible portfolio items, and physics-based driving.
- **Smooth Transitions** — Animated crossfade between all three views.
- **Mobile-first** — Landscape enforcement for game mode, responsive across all devices.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Animation:** Motion (Framer Motion)
- **Game Physics:** Matter.js + HTML5 Canvas

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## Project Structure

```
├── app/                  # Pages & layout
├── components/
│   ├── cli/              # Terminal UI
│   ├── game/             # Game canvas, controls, HUD
│   └── web/              # Web view sections
├── lib/
│   ├── cli/              # CLI engine & commands
│   ├── game/             # Game engine, physics, rendering
│   └── data/             # Portfolio data (TypeScript)
└── public/               # Static assets
```

## Customization

Edit the data files in `lib/data/` to update portfolio content. Game collectibles automatically pull from these files.

## Deploy

```bash
npx vercel
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andreikylehidalgo/portfolio)
