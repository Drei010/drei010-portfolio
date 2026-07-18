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

## Quality Checks

Run the same validation used by CI before opening a pull request:

```bash
npm run check
```

Individual checks are available as `npm run typecheck`, `npm run lint`,
`npm run test:repo`, `npm run test:physics`, and `npm run build`.

## Interaction and Accessibility Support

- Keyboard and coarse-pointer/touch controls are supported in game mode.
- Interrupted game input is cleared on cancellation, window blur, visibility loss,
  navigation, and unmount.
- Motion respects `prefers-reduced-motion`; decorative canvas animation stops its
  continuous frame loop when reduced motion is enabled.
- Dialogs trap focus, restore focus on close, and lock the portfolio scroll area.
- The target is WCAG 2.2 AA for keyboard, focus, form-error, and reduced-motion behavior.

## Game Physics Changes

Changes to vehicle dimensions, forces, suspension, collectibles, fixed stepping, or
render transforms must update the canonical values in `lib/game/config.ts` and pass
`npm run test:physics`. Do not duplicate tuning values in renderers or tests.
