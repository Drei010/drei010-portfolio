"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { projectsData } from "@/lib/data/projects";
import { Project } from "@/lib/types";
import { useWebScroll } from "@/lib/web-scroll-context";

const FPS = 24;
const FRAMES = 120;
// Screen coordinates measured on frame 119, letterboxed into the 1080px canvas.
const SCREEN_MASK = [
  [253, 311],
  [501, 311],
  [501, 321],
  [505, 324],
  [573, 324],
  [577, 321],
  [577, 311],
  [827, 311],
  [833, 314],
  [834, 319],
  [824, 683],
  [256, 683],
  [246, 319],
  [247, 314],
] as const;
const THUMBNAIL_FRAME = FRAMES - 1;
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

export function ProjectShowcase({
  onSelect,
  projectRefs,
}: ProjectShowcaseProps) {
  const { scrollContainerRef } = useWebScroll();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const descriptionRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const scroller = scrollContainerRef.current;
    if (!root || !canvas || !video || !scroller) return;

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
    let timeline: gsap.core.Timeline | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let disposed = false;
    let seekingFrame: number | null = null;
    let pendingFrame: number | null = null;
    let sourceFrameReady = false;
    let drawQueued = false;
    const sourceCanvas = document.createElement("canvas");
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });

    const updateSourceFrame = () => {
      if (video.readyState < 2 || !sourceContext) return;
      const sourceWidth = video.videoWidth || 1080;
      const sourceHeight = video.videoHeight || 1080;
      const width = Math.min(sourceWidth, KEYING_WIDTH);
      const height = Math.round((sourceHeight / sourceWidth) * width);
      if (sourceCanvas.width !== width || sourceCanvas.height !== height) {
        sourceCanvas.width = width;
        sourceCanvas.height = height;
      }

      sourceContext.clearRect(0, 0, width, height);
      sourceContext.drawImage(video, 0, 0, width, height);
      const pixels = sourceContext.getImageData(0, 0, width, height);
      const data = pixels.data;
      const keyDistance = Math.max(
        Math.abs(data[0] - KEY_COLOR),
        Math.abs(data[1] - KEY_COLOR),
        Math.abs(data[2] - KEY_COLOR)
      );

      // Keep the black-background WebM transparent consistently across browsers.
      if (data[3] > 0 && keyDistance < KEY_FEATHER_THRESHOLD) {
        for (let index = 0; index < data.length; index += 4) {
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
        sourceContext.putImageData(pixels, 0, 0);
      }
      sourceFrameReady = true;
    };

    const draw = () => {
      if (disposed || !canvas.width || !canvas.height) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, 1080, 1080);
      if (seekingFrame === null) updateSourceFrame();
      if (sourceFrameReady) {
        const scale = Math.min(1080 / sourceCanvas.width, 1080 / sourceCanvas.height);
        const width = sourceCanvas.width * scale;
        const height = sourceCanvas.height * scale;
        ctx.drawImage(sourceCanvas, (1080 - width) / 2, (1080 - height) / 2, width, height);
      }

      const thumbnailVisible = images.length > 0 && renderState.frame >= THUMBNAIL_FRAME
        && seekingFrame === null && Math.abs(video.currentTime - THUMBNAIL_FRAME / FPS) < 0.001;
      canvas.dataset.thumbnailVisible = String(thumbnailVisible);
      if (!thumbnailVisible) return;

      const mask = SCREEN_MASK;

      const drawThumbnail = (image: HTMLImageElement, opacity: number) => {
        if (!image.complete || !image.naturalWidth || opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(mask[0][0], mask[0][1]);
        mask.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, 246, 311, 588, 372);
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

    const seekToFrame = (frame: number) => {
      const nextFrame = Math.max(0, Math.min(FRAMES - 1, Math.round(frame)));
      pendingFrame = nextFrame;
      if (seekingFrame !== null || video.readyState < 1) {
        queueDraw();
        return;
      }

      if (Math.abs(video.currentTime - nextFrame / FPS) < 0.001) {
        pendingFrame = null;
        queueDraw();
        return;
      }

      pendingFrame = null;
      seekingFrame = nextFrame;
      video.currentTime = nextFrame / FPS;
      queueDraw();
    };

    const onSeeked = () => {
      const completedFrame = seekingFrame;
      seekingFrame = null;
      draw();

      if (pendingFrame !== null && pendingFrame !== completedFrame) {
        const nextFrame = pendingFrame;
        pendingFrame = null;
        seekToFrame(nextFrame);
      } else {
        pendingFrame = null;
      }
    };

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = 1080 * ratio;
      canvas.height = 1080 * ratio;
      canvas.style.aspectRatio = "1";
      const ctx = canvas.getContext("2d");
      ctx?.scale(ratio, ratio);
      draw();
    };

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });

    const setActive = (index: number) => {
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
      draw();
    };

    const setup = async () => {
      try {
        const metadataReady = new Promise<void>((resolve, reject) => {
          if (video.readyState >= 1) {
            resolve();
            return;
          }
          video.addEventListener("loadedmetadata", () => resolve(), { once: true });
          video.addEventListener("error", () => reject(new Error("Laptop animation could not load")), { once: true });
        });
        await metadataReady;
        const loadedImages = await Promise.all(
          projectsData.map((project) => loadImage(project.thumbnail))
        );
        if (disposed) return;
        images.push(...loadedImages);
        resizeCanvas();

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

        const sequence = gsap.timeline({
          defaults: { ease: "none" },
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
        sequence.to(renderState, {
          frame: FRAMES - 1,
          duration: 1,
          onUpdate: () => {
            seekToFrame(renderState.frame);
          },
        });
        projectsData.forEach((project, index) => {
          const panel = panelRefs.current[index];
          const title = panel?.querySelector(".project-showcase-title");
          const lines = splits[index]?.lines ?? [];
          const actions = panel?.querySelector(".project-showcase-actions");
          if (!panel || !title || !actions) return;

          if (index > 0) {
            sequence
              .to(panelRefs.current[index - 1], {
                autoAlpha: 0,
                duration: 0.2,
                onUpdate: function () {
                  setActive(this.progress() >= 0.5 ? index : index - 1);
                },
              })
              .to(panel, { autoAlpha: 1, duration: 0.2 }, "<")
              .to({}, { duration: 0.35 });
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
        root.classList.add("project-showcase-failed");
      }
    };

    const onMetadata = () => {
      seekToFrame(0);
    };
    const onMediaError = () => root.classList.add("project-showcase-failed");
    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onMediaError);
    video.src = "/videos/laptop-animation-alpha.webm";
    video.load();
    setup();

    return () => {
      disposed = true;
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onMediaError);
      resizeObserver?.disconnect();
      splits.forEach((split) => split.revert());
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      context.revert();
    };
  }, [scrollContainerRef]);

  return (
    <div ref={rootRef} className="project-showcase" data-testid="project-showcase">
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
