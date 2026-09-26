# Graph Report - portfolio  (2026-09-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 593 nodes · 1158 edges · 26 communities (21 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da009cfa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/page.tsx
- layout.tsx
- provider.ts
- lib/types.ts
- Terminal.tsx
- package.json
- engine.ts
- GameCanvas.tsx
- next
- test-vehicle-physics.mjs
- game/types.ts
- compilerOptions
- GameSession
- @playwright/test
- scripts
- vehicle-renderer.ts
- test-game-journey.mjs
- collectibles-renderer.ts
- test-repository.mjs
- ts-module-loader.mjs
- terrain.ts
- GameControls.tsx
- check-links.mjs
- postcss.config.mjs
- ref_sharp

## God Nodes (most connected - your core abstractions)
1. `GameSession()` - 24 edges
2. `react` - 21 edges
3. `useView()` - 19 edges
4. `updateGame()` - 17 edges
5. `motion` - 16 edges
6. `compilerOptions` - 16 edges
7. `next` - 15 edges
8. `Terminal()` - 13 edges
9. `scripts` - 13 edges
10. `renderGame()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `draw()` --indirect_call--> `scale()`  [INFERRED]
  components/game/GameCanvas.tsx → scripts/test-vehicle-physics.mjs
- `Home()` --calls--> `useView()`  [EXTRACTED]
  app/page.tsx → lib/view-context.tsx
- `Terminal()` --calls--> `useView()`  [EXTRACTED]
  components/cli/Terminal.tsx → lib/view-context.tsx
- `GameSession()` --calls--> `useView()`  [EXTRACTED]
  components/game/GameCanvas.tsx → lib/view-context.tsx
- `GameSession()` --calls--> `updateCamera()`  [EXTRACTED]
  components/game/GameCanvas.tsx → lib/game/camera.ts

## Import Cycles
- None detected.

## Communities (26 total, 5 thin omitted)

### Community 0 - "app/page.tsx"
Cohesion: 0.05
Nodes (42): GameCanvas, gameTransition, Home(), viewTransition, AnimatedHeading(), AnimatedHeadingProps, ConnectionLine, ConnectionOverlay() (+34 more)

### Community 1 - "layout.tsx"
Cohesion: 0.06
Nodes (41): app_globals, geistMono, geistSans, metadata, UNSAFE_SCRIPT_CHAR_MAP, viewport, GameToggle(), Header() (+33 more)

### Community 2 - "provider.ts"
Cohesion: 0.08
Nodes (33): POST(), encodeChatStreamEvent(), isRecord(), validateChatRequest(), buildPortfolioContext(), buildSystemPrompt(), GeminiChatProvider, GeminiProviderConfig (+25 more)

### Community 3 - "lib/types.ts"
Cohesion: 0.07
Nodes (38): colorMap, OutputLine(), OutputLineProps, AboutSection(), FormErrors, findPreparedAnswer(), normalizeQuestion(), PreparedAnswerMatch (+30 more)

### Community 4 - "Terminal.tsx"
Cohesion: 0.09
Nodes (32): CommandInput(), CommandInputProps, DESKTOP_ASCII_LINES, getChatErrorMessage(), getWelcomeLines(), MOBILE_ASCII_LINES, Terminal(), updateTerminalLine() (+24 more)

### Community 5 - "package.json"
Cohesion: 0.04
Nodes (44): eslintConfig, dependencies, gsap, @langchain/core, @langchain/google, matter-js, motion, next (+36 more)

### Community 6 - "engine.ts"
Cohesion: 0.18
Nodes (25): createCameraState(), checkCollectiblePickups(), createCollectibleState(), getPortfolioItemByIndex(), getTotalCollectibleCount(), removeOffscreenCollectibles(), spawnCollectibles(), initGameState() (+17 more)

### Community 7 - "GameCanvas.tsx"
Cohesion: 0.11
Nodes (15): Runtime, Snapshot, GameHUD(), GameHUDProps, checkBounds(), count(), setupKeyboardControls(), FIXED_PHYSICS_STEP_MS (+7 more)

### Community 8 - "next"
Cohesion: 0.11
Nodes (13): alt, contentType, size, metadata, robots(), sitemap(), metadata, LegalPage() (+5 more)

### Community 9 - "test-vehicle-physics.mjs"
Cohesion: 0.08
Nodes (8): collectiblesModule, fixedStepModule, Matter, rendererModule, scale(), tests, { VEHICLE_CONFIG }, vehicleModule

### Community 10 - "game/types.ts"
Cohesion: 0.12
Nodes (19): drawCloud(), getHills(), initClouds(), renderBackground(), applyCameraTransform(), getCameraZoom(), updateCamera(), renderGame() (+11 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "GameSession"
Cohesion: 0.24
Nodes (16): GameSession(), draw(), publish(), reset(), resize(), resume(), schedule(), start() (+8 more)

### Community 13 - "@playwright/test"
Cohesion: 0.14
Nodes (3): COMMANDS, SECTIONS, @playwright/test

### Community 14 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, check, check:links, dev, lint, start, test (+5 more)

### Community 15 - "vehicle-renderer.ts"
Cohesion: 0.31
Nodes (9): GAME_START_POSITION, VEHICLE_CONFIG, VEHICLE_RENDER_CONFIG, getChassisAnchor(), loadCarImage(), prepareVehicleImage(), renderSuspensionLink(), renderVehicle() (+1 more)

### Community 16 - "test-game-journey.mjs"
Cohesion: 0.18
Nodes (10): camera, collectibles, discoveries, game, { getCanvasBuffer }, Matter, { portfolioItems, CHAPTERS }, position (+2 more)

### Community 17 - "collectibles-renderer.ts"
Cohesion: 0.36
Nodes (9): drawCircleShape(), drawDiamond(), drawHexagon(), drawShape(), drawStar(), drawTriangle(), getColor(), renderCollectibles() (+1 more)

### Community 18 - "test-repository.mjs"
Cohesion: 0.20
Nodes (8): ref_node_assert, ai, autocomplete, camera, { contactData }, tests, theme, { VEHICLE_CONFIG }

### Community 19 - "ts-module-loader.mjs"
Cohesion: 0.22
Nodes (9): ref_node_fs, ref_node_module, ref_node_path, typescript, loadTypeScriptModule(), localRequire(), moduleCache, projectRequire (+1 more)

### Community 20 - "terrain.ts"
Cohesion: 0.43
Nodes (7): createTerrainState(), generateChunk(), getDifficultyMultiplier(), getFrequencyMultiplier(), getTerrainHeight(), noise(), updateTerrain()

## Knowledge Gaps
- **170 isolated node(s):** `AnimatedHeadingProps`, `ConnectionLine`, `ConnectionOverlayProps`, `ProjectCardProps`, `ProjectModalProps` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 249 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `layout.tsx` to `app/page.tsx`, `lib/types.ts`, `Terminal.tsx`, `package.json`, `GameCanvas.tsx`, `GameControls.tsx`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `typescript` connect `ts-module-loader.mjs` to `package.json`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `next` connect `next` to `app/page.tsx`, `layout.tsx`, `package.json`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `GameSession()` (e.g. with `reset()` and `resize()`) actually correct?**
  _`GameSession()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AnimatedHeadingProps`, `ConnectionLine`, `ConnectionOverlayProps` to the rest of the system?**
  _170 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05314685314685315 - nodes in this community are weakly interconnected._
- **Should `layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.057539682539682536 - nodes in this community are weakly interconnected._