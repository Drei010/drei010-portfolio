# Andrei Kyle Hidalgo — Developer Portfolio

A dual-view developer portfolio built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Web View** — Minimalist, responsive portfolio with About, Services, Skills, Projects, and Contact sections.
- **CLI View** — Orange-on-black hacker-aesthetic terminal with command history, tab completion, and AI-powered responses.
- **Mobile-first** — Designed for mobile, scales beautifully to desktop.
- **Toggle** — Switch between views via the header toggle button.

## CLI Commands

| Command | Description |
|---------|-------------|
| `help` | Show available commands |
| `about` | Learn about me |
| `skills` | View tech stack |
| `services` | View offered services |
| `projects` | Browse projects |
| `contact` | Contact info |
| `ask <query>` | Ask me anything (AI-powered) |
| `theme` | Switch to web view |
| `clear` | Clear the terminal |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

## Project Structure

```
├── app/              # Next.js App Router pages
├── components/
│   ├── cli/          # Terminal UI components
│   └── web/          # Web view sections
├── lib/
│   ├── cli/          # CLI engine (commands, parser, history, AI adapter)
│   └── data/         # Static portfolio data (TypeScript)
└── public/           # Static assets
```

## AI Integration

The CLI `ask` command uses a pluggable adapter pattern. Currently it uses a `StaticAdapter` with keyword-matched responses. To connect your RAG backend:

1. Implement the `AIAdapter` interface in `lib/cli/ai-adapter.ts`
2. Replace the `activeAdapter` with your implementation
3. See the comments in `ai-adapter.ts` for details

## Customization

Edit the data files in `lib/data/` to update your portfolio content:

- `about.ts` — Bio and personal info
- `services.ts` — Offered services
- `skills.ts` — Tech stack categories
- `projects.ts` — Project showcase
- `contact.ts` — Email and social links

## Deploy

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andreikylehidalgo/portfolio)

Or use the Vercel CLI:

```bash
npx vercel
```
