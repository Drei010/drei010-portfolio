"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { projectsData } from "@/lib/data/projects";
import { Project } from "@/lib/types";
import { useWebScroll } from "@/lib/web-scroll-context";

const FPS = 24;
// The supplied clip is fully open at frame 60; the remaining frames hold that pose.
const FRAMES = 61;
const ORBIT_FRAMES = 120;
const SOURCE_WIDTH = 960;
const SOURCE_HEIGHT = 720;
// Screen coordinates for the static camera, letterboxed into the 1080px canvas.
const SCREEN_MASK = [
  [203, 218],
  [505, 218],
  [505, 226],
  [509, 231],
  [590, 231],
  [594, 226],
  [594, 218],
  [895, 218],
  [880, 659],
  [216, 659],
] as const;
const THUMBNAIL_FRAME = FRAMES - 1;
// Match the open laptop's visible bounds to the orbit clip.
const TRANSITION_SCALE = 0.821;
const TRANSITION_Y = 33;
const SWIVEL_SCREEN_MASK = [
  [253, 311], [501, 311], [501, 321], [505, 324], [573, 324],
  [577, 321], [577, 311], [827, 311], [833, 314], [834, 319],
  [824, 683], [256, 683], [246, 319], [247, 314],
] as const;
// ponytail: cap chroma-key work at 960px; the canvas scales the cached frame back up.
const KEYING_WIDTH = 960;
const KEY_COLOR = 0;
const KEY_HARD_THRESHOLD = 32;
const KEY_FEATHER_THRESHOLD = 48;

type ProjectShowcaseProps = {
  onSelect: (project: Project) => void;
  projectRefs?: (id: string, el: HTMLElement | null) => void;
};

type RenderState = {
  frame: number;
  project: number;
  nextProject: number;
  blend: number;
};

type CachedFrame = {
  bitmap: ImageBitmap;
  x: number;
  y: number;
};

export function ProjectShowcase({
  onSelect,
  projectRefs,
}: ProjectShowcaseProps) {
  const { scrollContainerRef } = useWebScroll();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionVideoRef = useRef<HTMLVideoElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const descriptionRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const swivelVideo = videoRef.current;
    const transitionVideo = transitionVideoRef.current;
    const scroller = scrollContainerRef.current;
    if (!root || !canvas || !swivelVideo || !transitionVideo || !scroller) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px) and (min-height: 700px)");
    if (reduceMotion.matches || !desktop.matches) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const context = gsap.context(() => {}, root);
    const renderState: RenderState = {
      frame: 0,
      project: 0,
      nextProject: 0,
      blend: 0,
    };
    const images: HTMLImageElement[] = [];
    const splits: SplitText[] = [];
    const frameCache: { orbit: (CachedFrame | null)[]; transition: (CachedFrame | null)[] } = {
      orbit: [],
      transition: [],
    };
    const preparation = new AbortController();
    const projectSection = root.closest<HTMLElement>("#projects");
    let timeline: gsap.core.Timeline | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let disposed = false;
    let cacheReady = false;
    let reachedProjects = false;
    let activeClip: "orbit" | "transition" = "orbit";
    let drawQueued = false;
    let drawnState = "";
    const sourceCanvas = document.createElement("canvas");
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });

    const closeFrames = (frames: (CachedFrame | null)[]) => {
      frames.forEach((frame) => frame?.bitmap.close());
      frames.length = 0;
    };

    const releaseCache = () => {
      closeFrames(frameCache.orbit);
      closeFrames(frameCache.transition);
    };

    const stopVideos = () => {
      for (const clip of [swivelVideo, transitionVideo]) {
        clip.pause();
        clip.removeAttribute("src");
        clip.load();
      }
    };

    const hasReachedProjects = () =>
      !!projectSection && projectSection.getBoundingClientRect().top <= scroller.getBoundingClientRect().bottom;

    const onScroll = () => {
      if (cacheReady || reachedProjects || !hasReachedProjects()) return;
      reachedProjects = true;
      preparation.abort();
      releaseCache();
      stopVideos();
    };

    const waitForMetadata = (clip: HTMLVideoElement, signal: AbortSignal) =>
      new Promise<void>((resolve, reject) => {
        if (clip.readyState >= 1) {
          resolve();
          return;
        }
        const cleanup = () => {
          clip.removeEventListener("loadedmetadata", onReady);
          clip.removeEventListener("error", onError);
          signal.removeEventListener("abort", onAbort);
        };
        const onReady = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(new Error("Laptop animation could not load")); };
        const onAbort = () => { cleanup(); reject(new DOMException("Preparation stopped", "AbortError")); };
        clip.addEventListener("loadedmetadata", onReady, { once: true });
        clip.addEventListener("error", onError, { once: true });
        signal.addEventListener("abort", onAbort, { once: true });
        if (signal.aborted) onAbort();
      });

    const seekForBake = (clip: HTMLVideoElement, time: number, signal: AbortSignal) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) {
          reject(new DOMException("Preparation stopped", "AbortError"));
          return;
        }
        if (clip.readyState >= 2 && Math.abs(clip.currentTime - time) < 0.0001) {
          resolve();
          return;
        }
        if (Math.abs(clip.currentTime - time) < 0.0001) {
          const cleanup = () => {
            clip.removeEventListener("loadeddata", onLoadedData);
            clip.removeEventListener("error", onError);
            signal.removeEventListener("abort", onAbort);
          };
          const onLoadedData = () => { cleanup(); resolve(); };
          const onError = () => { cleanup(); reject(new Error("Laptop animation could not decode")); };
          const onAbort = () => { cleanup(); reject(new DOMException("Preparation stopped", "AbortError")); };
          clip.addEventListener("loadeddata", onLoadedData, { once: true });
          clip.addEventListener("error", onError, { once: true });
          signal.addEventListener("abort", onAbort, { once: true });
          if (signal.aborted) onAbort();
          return;
        }
        const cleanup = () => {
          clip.removeEventListener("seeked", onSeeked);
          clip.removeEventListener("error", onError);
          signal.removeEventListener("abort", onAbort);
        };
        const onSeeked = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(new Error("Laptop animation could not decode")); };
        const onAbort = () => { cleanup(); reject(new DOMException("Preparation stopped", "AbortError")); };
        clip.addEventListener("seeked", onSeeked, { once: true });
        clip.addEventListener("error", onError, { once: true });
        signal.addEventListener("abort", onAbort, { once: true });
        try {
          clip.currentTime = time;
        } catch (error) {
          cleanup();
          reject(error);
        }
      });

    const bakeFrame = async (clip: HTMLVideoElement, frameIndex: number, signal: AbortSignal) => {
      if (!sourceContext) throw new Error("Frame canvas is unavailable");
      const sourceWidth = clip.videoWidth || SOURCE_WIDTH;
      const width = Math.min(sourceWidth, KEYING_WIDTH);
      const height = Math.round((clip.videoHeight || SOURCE_HEIGHT) / sourceWidth * width);
      if (sourceCanvas.width !== width || sourceCanvas.height !== height) {
        sourceCanvas.width = width;
        sourceCanvas.height = height;
      }

      await seekForBake(clip, frameIndex / FPS, signal);
      sourceContext.clearRect(0, 0, width, height);
      sourceContext.drawImage(clip, 0, 0, width, height);
      const topLeft = sourceContext.getImageData(0, 0, 1, 1).data;
      const keyDistance = Math.max(
        Math.abs(topLeft[0] - KEY_COLOR),
        Math.abs(topLeft[1] - KEY_COLOR),
        Math.abs(topLeft[2] - KEY_COLOR)
      );
      // The orbit clip needs a black key; the open/close clip keeps its native alpha when available.
      const shouldKey = topLeft[3] > 0 && keyDistance < KEY_FEATHER_THRESHOLD;
      const pixels = sourceContext.getImageData(0, 0, width, height);
      const data = pixels.data;
      let left = width;
      let top = height;
      let right = -1;
      let bottom = -1;

      for (let index = 0; index < data.length; index += 4) {
        if (shouldKey) {
          const distance = Math.max(
            Math.abs(data[index] - KEY_COLOR),
            Math.abs(data[index + 1] - KEY_COLOR),
            Math.abs(data[index + 2] - KEY_COLOR)
          );
          if (distance <= KEY_HARD_THRESHOLD) {
            data[index + 3] = 0;
          } else if (distance < KEY_FEATHER_THRESHOLD) {
            data[index + 3] = Math.round(
              (data[index + 3] * (distance - KEY_HARD_THRESHOLD)) /
                (KEY_FEATHER_THRESHOLD - KEY_HARD_THRESHOLD)
            );
          }
        }

        if (data[index + 3] === 0) continue;
        const pixel = index / 4;
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }

      if (shouldKey) sourceContext.putImageData(pixels, 0, 0);
      if (right < left || bottom < top) return null;
      const x = Math.max(0, left - 1);
      const y = Math.max(0, top - 1);
      const cropWidth = Math.min(width - x, right - left + 3);
      const cropHeight = Math.min(height - y, bottom - top + 3);
      const bitmap = await createImageBitmap(sourceCanvas, x, y, cropWidth, cropHeight);
      if (signal.aborted) {
        bitmap.close();
        throw new DOMException("Preparation stopped", "AbortError");
      }
      return { bitmap, x, y } satisfies CachedFrame;
    };

    const bakeClip = async (clip: HTMLVideoElement, count: number, signal: AbortSignal) => {
      const frames: (CachedFrame | null)[] = [];
      try {
        for (let frameIndex = 0; frameIndex < count; frameIndex += 1) {
          frames.push(await bakeFrame(clip, frameIndex, signal));
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        }
        return frames;
      } catch (error) {
        closeFrames(frames);
        throw error;
      }
    };

    const draw = () => {
      if (disposed || !cacheReady || !canvas.width || !canvas.height) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const swivel = activeClip === "orbit";
      const frameIndex = swivel
        ? Math.round(Math.max(0, Math.min(THUMBNAIL_FRAME, renderState.frame)) * (ORBIT_FRAMES - 1) / THUMBNAIL_FRAME)
        : Math.round(Math.max(0, Math.min(THUMBNAIL_FRAME, renderState.frame)));
      const frame = (swivel ? frameCache.orbit : frameCache.transition)[frameIndex];
      if (!frame) return;
      const thumbnailVisible = images.length > 0 && renderState.frame >= THUMBNAIL_FRAME;
      canvas.dataset.frameIndex = String(frameIndex);
      canvas.dataset.frameClip = swivel ? "orbit" : "transition";
      canvas.dataset.logicalFrame = String(renderState.frame);
      const nextDrawnState = [swivel, frameIndex, thumbnailVisible, renderState.project,
        renderState.nextProject, renderState.blend, canvas.width, canvas.height].join(":");
      if (drawnState === nextDrawnState) return;
      drawnState = nextDrawnState;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, 1080, 1080);
      const fit = Math.min(1080 / SOURCE_WIDTH, 1080 / SOURCE_HEIGHT);
      const scale = fit * (swivel ? 1 : TRANSITION_SCALE);
      const sourceX = (1080 - SOURCE_WIDTH * scale) / 2;
      const sourceY = (1080 - SOURCE_HEIGHT * scale) / 2 + (swivel ? 0 : TRANSITION_Y);
      ctx.drawImage(
        frame.bitmap,
        sourceX + frame.x * scale,
        sourceY + frame.y * scale,
        frame.bitmap.width * scale,
        frame.bitmap.height * scale
      );

      canvas.dataset.thumbnailVisible = String(thumbnailVisible);
      if (!thumbnailVisible) return;

      const mask = swivel ? SWIVEL_SCREEN_MASK : SCREEN_MASK;
      const laptopScale = swivel ? 1 : TRANSITION_SCALE;

      const drawThumbnail = (image: HTMLImageElement, opacity: number) => {
        if (!image.complete || !image.naturalWidth || opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(540, 540 + (swivel ? 0 : TRANSITION_Y));
        ctx.scale(laptopScale, laptopScale);
        ctx.translate(-540, -540);
        ctx.beginPath();
        ctx.moveTo(mask[0][0], mask[0][1]);
        mask.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        ctx.clip();
        if (swivel) ctx.drawImage(image, 246, 311, 588, 372);
        else ctx.drawImage(image, 203, 218, 692, 441);
        ctx.restore();
      };

      const current = images[renderState.project];
      const next = images[renderState.nextProject];
      drawThumbnail(current, 1 - renderState.blend);
      if (next && renderState.nextProject !== renderState.project) {
        drawThumbnail(next, renderState.blend);
      }
    };

    const queueDraw = () => {
      if (drawQueued || disposed) return;
      drawQueued = true;
      window.requestAnimationFrame(() => {
        drawQueued = false;
        draw();
      });
    };

    const resizeCanvas = () => {
      // Keep the output backing buffer at source resolution even on high-DPI screens.
      const size = Math.min(SOURCE_WIDTH, Math.round(canvas.getBoundingClientRect().width * (window.devicePixelRatio || 1)));
      if (!size || (canvas.width === size && canvas.height === size)) return;
      canvas.width = size;
      canvas.height = size;
      canvas.style.aspectRatio = "1";
      const ctx = canvas.getContext("2d");
      ctx?.scale(size / 1080, size / 1080);
      queueDraw();
    };

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });

    const setActive = (index: number) => {
      if (renderState.project === index && panelRefs.current[index]?.dataset.showcaseActive === "true") return;
      renderState.project = index;
      renderState.nextProject = index;
      renderState.blend = 0;
      panelRefs.current.forEach((panel, panelIndex) => {
        if (!panel) return;
        const active = panelIndex === index;
        panel.setAttribute("aria-hidden", String(!active));
        panel.dataset.showcaseActive = String(active);
        panel.toggleAttribute("inert", !active);
      });
      queueDraw();
    };

    const setup = async () => {
      try {
        const { signal } = preparation;
        const loadedImagesPromise = Promise.all(
          projectsData.map((project) => loadImage(project.thumbnail))
        );
        loadedImagesPromise.catch(() => {});
        await Promise.all([waitForMetadata(swivelVideo, signal), waitForMetadata(transitionVideo, signal)]);
        if (signal.aborted) return;
        frameCache.orbit.push(...await bakeClip(swivelVideo, ORBIT_FRAMES, signal));
        frameCache.transition.push(...await bakeClip(transitionVideo, FRAMES, signal));
        const loadedImages = await loadedImagesPromise;
        if (disposed || signal.aborted) return;
        images.push(...loadedImages);

        splits.push(
          ...descriptionRefs.current.map(
            (description) =>
              new SplitText(description, {
                type: "lines",
                linesClass: "project-showcase-line",
                autoSplit: true,
              })
          )
        );

        gsap.set(panelRefs.current, { autoAlpha: 0 });
        gsap.set(panelRefs.current[0], { autoAlpha: 1 });
        gsap.set(root.querySelectorAll(".project-showcase-title, .project-showcase-line, .project-showcase-actions"), {
          autoAlpha: 0,
          y: 22,
        });
        setActive(0);

        let firstTransitionAt = Infinity;
        const sequence = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => {
            const nextClip = sequence.time() <= firstTransitionAt ? "orbit" : "transition";
            if (activeClip !== nextClip) {
              activeClip = nextClip;
              swivelVideo.dataset.active = String(activeClip === "orbit");
              transitionVideo.dataset.active = String(activeClip === "transition");
            }
            queueDraw();
          },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight * 7, window.innerHeight * (timeline?.duration() ?? 7))}`,
            pin: true,
            scroller,
            scrub: 0.35,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline = sequence;
        cacheReady = true;
        root.dataset.cacheReady = "true";
        resizeCanvas();
        sequence.to(renderState, {
          frame: FRAMES - 1,
          duration: 1,
        });
        projectsData.forEach((project, index) => {
          const panel = panelRefs.current[index];
          const title = panel?.querySelector(".project-showcase-title");
          const lines = splits[index]?.lines ?? [];
          const actions = panel?.querySelector(".project-showcase-actions");
          if (!panel || !title || !actions) return;

          if (index > 0) {
            if (index === 1) firstTransitionAt = sequence.duration();
            sequence
              .to(renderState, {
                frame: 0,
                duration: 1,
              })
              .to(panelRefs.current[index - 1], {
                autoAlpha: 0,
                duration: 0.2,
                onUpdate: function () {
                  setActive(this.progress() >= 0.5 ? index : index - 1);
                },
              })
              .to(panel, { autoAlpha: 1, duration: 0.2 }, "<")
              .to({}, { duration: 0.35 })
              .to(renderState, {
                frame: FRAMES - 1,
                duration: 1,
              });
          }

            sequence
            .to(title, { autoAlpha: 1, y: 0, duration: 0.35 })
            .to(lines, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.18 })
            .to(actions, { autoAlpha: 1, y: 0, duration: 0.3 })
            .to({}, { duration: 0.55 });
        });

        resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(root);
        ScrollTrigger.refresh();
      } catch {
        if (!preparation.signal.aborted) {
          root.classList.add("project-showcase-failed");
          root.dataset.cacheReady = "false";
          cacheReady = false;
          timeline?.scrollTrigger?.kill();
          timeline?.kill();
        }
        releaseCache();
      }
    };

    const onMediaError = () => {
      root.classList.add("project-showcase-failed");
      root.dataset.cacheReady = "false";
      cacheReady = false;
      preparation.abort();
      releaseCache();
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (!reachedProjects) {
      swivelVideo.src = "/videos/macbook-air-orbit-scrub.webm";
      transitionVideo.src = "/videos/macbook-air-open-close-scrub.webm";
      for (const clip of [swivelVideo, transitionVideo]) {
        clip.addEventListener("error", onMediaError);
        clip.load();
      }
      setup();
    }

    return () => {
      disposed = true;
      preparation.abort();
      releaseCache();
      scroller.removeEventListener("scroll", onScroll);
      for (const clip of [swivelVideo, transitionVideo]) {
        clip.removeEventListener("error", onMediaError);
        clip.pause();
        clip.removeAttribute("src");
        clip.load();
      }
      resizeObserver?.disconnect();
      splits.forEach((split) => split.revert());
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      context.revert();
    };
  }, [scrollContainerRef]);

  return (
    <div ref={rootRef} className="project-showcase" data-testid="project-showcase" data-cache-ready="false">
      <div className="project-showcase-pin">
        <div className="project-showcase-grid">
          <div className="project-showcase-copy">
            <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted">
              <span className="h-px w-8 bg-primary" />
              Scroll to explore
            </div>
            <div className="project-showcase-panels">
              {projectsData.map((project, index) => (
                <article
                  key={project.id}
                  ref={(element) => {
                    panelRefs.current[index] = element;
                    if (!element) {
                      projectRefs?.(project.id, null);
                    } else if (element.offsetParent) {
                      projectRefs?.(project.id, element);
                    }
                  }}
                  className="project-showcase-panel"
                  aria-hidden={index !== 0}
                  inert={index !== 0}
                >
                  <p className="mb-3 text-sm font-medium text-primary">0{index + 1} / 0{projectsData.length}</p>
                  <h3 className="project-showcase-title mb-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                    {project.title}
                  </h3>
                  <p
                    ref={(element) => {
                      descriptionRefs.current[index] = element;
                    }}
                    className="project-showcase-description max-w-lg text-lg leading-relaxed text-muted"
                  >
                    {project.description}
                  </p>
                  <div className="project-showcase-actions mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                      onClick={() => onSelect(project)}
                    >
                      View details
                    </button>
                    <a
                      href={project.liveUrl ?? project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                    >
                      {project.liveUrl ? "Live site ↗" : "View source ↗"}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="project-showcase-device" aria-label="Animated laptop showing project thumbnails" role="img">
            <canvas ref={canvasRef} className="project-showcase-canvas" />
            <video
              ref={videoRef}
              className="project-showcase-video"
              data-active="true"
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
            <video
              ref={transitionVideoRef}
              className="project-showcase-video"
              data-active="false"
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
