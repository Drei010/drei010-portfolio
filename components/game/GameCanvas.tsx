"use client";

import { useRef, useEffect, useState } from "react";
import type { ControlsState, GamePhase, PortfolioItem } from "@/lib/game/types";
import { initGameState, updateGame, renderGame, cleanupGame, recoverVehicle } from "@/lib/game/engine";
import { setupKeyboardControls } from "@/lib/game/controls";
import { consumeFixedSteps, FIXED_PHYSICS_STEP_MS } from "@/lib/game/fixed-step";
import { createCameraState, updateCamera } from "@/lib/game/camera";
import { getCanvasBuffer } from "@/lib/game/viewport";
import { prepareVehicleImage } from "@/lib/game/vehicle-renderer";
import { CHAPTERS, CHAPTER_COLORS, portfolioItems } from "@/lib/game/portfolio";
import { GameControls } from "./GameControls";
import { GameHUD } from "./GameHUD";
import { useView } from "@/lib/view-context";

type Snapshot = { phase: GamePhase; distance: number; discovered: number[]; latest: PortfolioItem | null };
type Runtime = { control: (name: keyof ControlsState, pressed: boolean) => void; start: () => void; recover: () => void; reset: () => void };

export function GameCanvas() {
  const [run, setRun] = useState(0);
  return <GameSession key={run} onReplay={() => setRun(value => value + 1)} />;
}

function GameSession({ onReplay }: { onReplay: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const completeRef = useRef<HTMLHeadingElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const [ui, setUI] = useState<Snapshot>({ phase: "ready", distance: 0, discovered: [], latest: null });
  const [selection, setSelection] = useState<PortfolioItem | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const collectionOpenRef = useRef(false);
  const [collectionFilter, setCollectionFilter] = useState<"all" | "projects">("all");
  const [error, setError] = useState(false);
  const { setView } = useView();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const shell = shellRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) { setError(true); return; }
    let state = initGameState();
    let controls: ControlsState = { gasPressed: false, brakePressed: false };
    let width = 0, height = 0, scale = 1, frame = 0, lastTime = 0, accumulator = 0, lastPublish = 0;
    let disposed = false, suspended = document.hidden;
    let latest: PortfolioItem | null = null;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function reset() { controls = { gasPressed: false, brakePressed: false }; }
    function publish() { setUI({ phase: state.phase, distance: state.distance, discovered: state.collectibles.collectedDataIndices, latest }); }
    function draw(time = 0) {
      if (disposed || !width || !height || !ctx) return;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      renderGame(ctx, state, width, height, time, motion.matches);
    }
    function schedule() {
      if (!disposed && !suspended && !frame && width && height && state.phase === "playing") frame = requestAnimationFrame(tick);
    }
    function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; accumulator = 0; reset(); }
    function start() {
      if (state.phase === "ready") { state.phase = "playing"; publish(); }
      schedule();
    }
    function tick(time: number) {
      frame = 0;
      if (disposed || suspended || state.phase !== "playing") return;
      const batch = consumeFixedSteps(accumulator, lastTime ? time - lastTime : FIXED_PHYSICS_STEP_MS);
      lastTime = time;
      accumulator = batch.remainder;
      let discovered = false;
      for (let step = 0; step < batch.steps; step++) {
        const result = updateGame(state, controls, width, height, FIXED_PHYSICS_STEP_MS);
        state = result.state;
        for (const event of result.events) {
          latest = event.item;
          if (!collectionOpenRef.current) setSelection(event.item);
          discovered = true;
        }
      }
      draw(time);
      if (discovered || state.phase === "complete" || time - lastPublish >= 100) { publish(); lastPublish = time; }
      if (state.phase === "complete") { stop(); setSelection(null); collectionOpenRef.current = false; setCollectionOpen(false); }
      else schedule();
    }
    function resize() {
      const rect = shell.getBoundingClientRect();
      const buffer = getCanvasBuffer(rect.width, rect.height, window.devicePixelRatio);
      if (width === rect.width && height === rect.height && scale === buffer.scale) return;
      reset();
      width = rect.width; height = rect.height; scale = buffer.scale;
      canvas.width = buffer.width; canvas.height = buffer.height;
      state.camera = updateCamera(createCameraState(), state.vehicle, width, height);
      if (state.phase === "ready") state = updateGame(state, controls, width, height, 0).state;
      draw(); schedule();
    }
    function suspend() { suspended = true; stop(); }
    function resume() { suspended = document.hidden; lastTime = 0; accumulator = 0; resize(); schedule(); }
    function visibility() { if (document.hidden) suspend(); else resume(); }
    const keyboard = setupKeyboardControls(updater => { controls = updater(controls); if (controls.gasPressed || controls.brakePressed) start(); });
    runtime.current = {
      control(name, pressed) { controls = { ...controls, [name]: pressed }; if (pressed) start(); },
      start, reset,
      recover() { reset(); recoverVehicle(state); draw(); },
    };
    const observer = new ResizeObserver(resize);
    observer.observe(shell);
    resize();
    const cleanupImage = prepareVehicleImage(() => draw());
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", suspend);
    window.addEventListener("focus", resume);
    window.addEventListener("pagehide", suspend);
    window.addEventListener("pageshow", resume);
    window.visualViewport?.addEventListener("resize", resize);
    motion.addEventListener("change", resize);
    shell.focus({ preventScroll: true });
    return () => {
      disposed = true; stop(); observer.disconnect(); keyboard(); cleanupImage(); cleanupGame(state); runtime.current = null;
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", suspend); window.removeEventListener("focus", resume);
      window.removeEventListener("pagehide", suspend); window.removeEventListener("pageshow", resume);
      window.visualViewport?.removeEventListener("resize", resize);
      motion.removeEventListener("change", resize);
    };
  }, []);

  useEffect(() => {
    if (!ui.latest) return;
    const timer = window.setTimeout(() => {
      if (!collectionOpenRef.current && !cardRef.current?.contains(document.activeElement)) setSelection(current => current?.id === ui.latest?.id ? null : current);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [ui.latest]);

  useEffect(() => {
    if (ui.phase === "complete") completeRef.current?.focus();
  }, [ui.phase]);

  const back = () => { runtime.current?.reset(); setView("web"); };
  const closeCollection = () => {
    collectionOpenRef.current = false;
    setCollectionOpen(false); setSelection(null);
    shellRef.current?.querySelector<HTMLButtonElement>("[aria-controls=game-collection]")?.focus();
  };
  const openCollection = (filter: "all" | "projects" = "all") => {
    collectionOpenRef.current = true;
    runtime.current?.reset(); setCollectionFilter(filter); setCollectionOpen(true); setSelection(null);
  };
  const contact = portfolioItems[portfolioItems.length - 1];

  return <div ref={shellRef} className="game-shell" tabIndex={-1} data-phase={ui.phase} aria-label="Hill Roll portfolio journey" onKeyDown={event => {
    if (event.key === "Escape") { if (collectionOpen) closeCollection(); else setSelection(null); }
  }}>
    <canvas ref={canvasRef} className="game-canvas" aria-label="Hill Climb Racing portfolio game" />
    <GameHUD distance={ui.distance} collected={ui.discovered.length} onBack={back} collectionOpen={collectionOpen} onCollection={() => collectionOpen ? closeCollection() : openCollection()} />

    {error ? <section className="game-intro"><h1>Let’s take the scenic route.</h1><p>Your browser could not start the canvas.</p><button className="game-button" onClick={back}>Open portfolio</button></section> : ui.phase === "ready" && <section className="game-intro" aria-labelledby="game-title">
      <h1 id="game-title">HILL ROLL<span>PORTFOLIO</span></h1>
      <p>A little drive. A closer look at my work.</p>
      <ol className="game-chapters" aria-label="Journey chapters">{CHAPTERS.map((chapter, index) => <li key={chapter}><span>{index + 1}</span>{chapter}</li>)}</ol>
      <button className="game-button game-primary" onClick={() => { runtime.current?.start(); shellRef.current?.focus(); }}>Start your engine <span aria-hidden="true">→</span></button>
      <p className="game-instructions"><span className="game-key-hint">Hold → / D to drive · ← / A to brake.</span><span className="game-touch-hint">Hold GAS to drive · BRAKE to reverse.</span><br />Collect shapes to discover all {portfolioItems.length} pieces.</p>
    </section>}

    <div className="sr-only" role="status" aria-live="polite">{ui.phase === "complete" ? "Journey complete. You discovered the whole portfolio." : ui.latest ? `Discovered ${ui.latest.title}. ${ui.discovered.length} of ${portfolioItems.length}. Available in Collection.` : ""}</div>

    {ui.phase === "playing" && selection && !collectionOpen && <section ref={cardRef} className="game-discovery" aria-label="Latest discovery">
      <div className="game-card-top"><span style={{ color: CHAPTER_COLORS[selection.type] }}>{selection.type} discovered</span><button className="game-icon-button" aria-label="Collapse discovery" onClick={() => setSelection(null)}>×</button></div>
      <DiscoveryContent item={selection} />
    </section>}

    {collectionOpen && <section id="game-collection" className="game-collection" aria-label="Discovered portfolio items">
      <div className="game-card-top"><h2>{collectionFilter === "projects" ? "Discovered projects" : "Your collection"}</h2><button className="game-icon-button" aria-label="Close collection" onClick={closeCollection}>×</button></div>
      {ui.discovered.length === 0 ? <p>Your first discovery is up the road. Hold GAS or → to find it.</p> : <>
        {selection ? <><button className="game-button" onClick={() => setSelection(null)}>All discoveries</button><DiscoveryContent item={selection} /></> : <ul className="game-collection-list">{ui.discovered.map(index => portfolioItems[index]).filter(item => collectionFilter === "all" || item.type === "projects").map(item => <li key={item.id}><button onClick={() => setSelection(item)}><span>{item.title}</span><small style={{ color: CHAPTER_COLORS[item.type] }}>{item.type}</small><span aria-hidden="true">→</span></button></li>)}</ul>}
      </>}
    </section>}

    {ui.phase === "complete" && !collectionOpen && <section className="game-complete" aria-labelledby="game-complete-title">
      <svg className="game-finish-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M10 42V6m1 2h26l-6 8 6 8H11" /></svg>
      <h2 ref={completeRef} tabIndex={-1} id="game-complete-title">You’ve seen the whole road.</h2>
      <p>{portfolioItems.length} discoveries. Five chapters. Thanks for taking a look around.</p>
      <div className="game-finish-actions"><button className="game-button game-primary" onClick={() => openCollection("projects")}>View discovered projects</button><a className="game-button" href={contact.actions![0].href}>Contact Andrei</a><button className="game-button" onClick={onReplay}>Replay journey</button><button className="game-button" onClick={back}>Return to portfolio</button></div>
    </section>}

    {!error && ui.phase !== "complete" && <>
      <GameControls onGasStart={() => runtime.current?.control("gasPressed", true)} onGasEnd={() => runtime.current?.control("gasPressed", false)} onBrakeStart={() => runtime.current?.control("brakePressed", true)} onBrakeEnd={() => runtime.current?.control("brakePressed", false)} />
      {ui.phase === "playing" && <button className="game-button game-recover" onClick={() => { runtime.current?.recover(); shellRef.current?.focus(); }} title="Put the car upright without losing discoveries">Right car</button>}
    </>}
  </div>;
}

function DiscoveryContent({ item }: { item: PortfolioItem }) {
  return <><h3>{item.title}</h3><p>{item.summary}</p>{item.actions?.length ? <div className="game-card-actions">{item.actions.map(action => <a className="game-button" key={action.href} href={action.href} target={action.href.startsWith("https:") ? "_blank" : undefined} rel={action.href.startsWith("https:") ? "noopener noreferrer" : undefined}>{action.label}<span aria-hidden="true">↗</span></a>)}</div> : null}</>;
}
