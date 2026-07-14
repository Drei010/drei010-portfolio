"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "@/lib/theme-context";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type ConstellationBackgroundProps = {
  className?: string;
};

const NODE_COUNT = 50;
const CONNECTION_DISTANCE = 150;
const CURSOR_CONNECTION_DISTANCE = 200;
const NODE_MIN_RADIUS = 1.5;
const NODE_MAX_RADIUS = 3;
const DRIFT_SPEED = 0.12;
const LINE_COLOR = "249, 115, 22"; // #f97316 in RGB
const AMBIENT_LINE_WIDTH = 1;
const CURSOR_LINE_WIDTH = 1.5;
const AMBIENT_MAX_OPACITY = 0.35;
const CURSOR_MAX_OPACITY = 0.6;
const NODE_OPACITY = 0.5;
const MIN_NODE_SPACING = 80;
const LIGHT_MODE_OPACITY_SCALE = 0.4;

function createNodes(width: number, height: number): Node[] {
  if (width === 0 || height === 0) return [];

  const nodes: Node[] = [];
  const cols = Math.ceil(Math.sqrt(NODE_COUNT * (width / height)));
  const rows = Math.ceil(NODE_COUNT / cols);
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (nodes.length >= NODE_COUNT) break;

      const jitterX = (Math.random() - 0.5) * cellWidth * 0.8;
      const jitterY = (Math.random() - 0.5) * cellHeight * 0.8;
      const x = Math.max(0, Math.min(width, (col + 0.5) * cellWidth + jitterX));
      const y = Math.max(0, Math.min(height, (row + 0.5) * cellHeight + jitterY));

      const tooClose = nodes.some((n) => {
        const dx = n.x - x;
        const dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) < MIN_NODE_SPACING;
      });

      if (!tooClose) {
        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * DRIFT_SPEED * 2,
          vy: (Math.random() - 0.5) * DRIFT_SPEED * 2,
          radius: NODE_MIN_RADIUS + Math.random() * (NODE_MAX_RADIUS - NODE_MIN_RADIUS),
        });
      }
    }
  }

  let attempts = 0;
  while (nodes.length < NODE_COUNT && attempts < 200) {
    attempts++;
    const x = Math.random() * width;
    const y = Math.random() * height;

    const tooClose = nodes.some((n) => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) < MIN_NODE_SPACING;
    });

    if (!tooClose) {
      nodes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * DRIFT_SPEED * 2,
        vy: (Math.random() - 0.5) * DRIFT_SPEED * 2,
        radius: NODE_MIN_RADIUS + Math.random() * (NODE_MAX_RADIUS - NODE_MIN_RADIUS),
      });
    }
  }

  return nodes;
}

export function ConstellationBackground({ className }: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const hasPointerRef = useRef<boolean>(false);
  const shouldReduceMotion = useReducedMotion();
  const shouldReduceMotionRef = useRef(shouldReduceMotion);
  const { theme } = useTheme();
  const opacityScale = theme === "light" ? LIGHT_MODE_OPACITY_SCALE : 1;
  const opacityScaleRef = useRef(opacityScale);
  const initializedRef = useRef(false);

  useEffect(() => {
    opacityScaleRef.current = opacityScale;
  }, [opacityScale]);

  useEffect(() => {
    shouldReduceMotionRef.current = shouldReduceMotion;
  }, [shouldReduceMotion]);

  const syncCanvasSize = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height;

    if (newWidth === 0 || newHeight === 0) {
      return { newWidth: 0, newHeight: 0 };
    }

    canvas.width = newWidth * dpr;
    canvas.height = newHeight * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    sizeRef.current = { width: newWidth, height: newHeight };

    return { newWidth, newHeight };
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = sizeRef.current;
      if (width === 0 || height === 0) return;

      const scale = opacityScaleRef.current;
      const reduceMotion = shouldReduceMotionRef.current;

      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;

      if (!reduceMotion) {
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0) {
            node.x = 0;
            node.vx = Math.abs(node.vx);
          } else if (node.x > width) {
            node.x = width;
            node.vx = -Math.abs(node.vx);
          }

          if (node.y < 0) {
            node.y = 0;
            node.vy = Math.abs(node.vy);
          } else if (node.y > height) {
            node.y = height;
            node.vy = -Math.abs(node.vy);
          }
        }
      }

      // Draw ambient connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            const opacity =
              AMBIENT_MAX_OPACITY * scale * (1 - distance / CONNECTION_DISTANCE);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity})`;
            ctx.lineWidth = AMBIENT_LINE_WIDTH;
            ctx.stroke();
          }
        }
      }

      // Draw cursor connections
      const mouse = mouseRef.current;
      if (mouse.active && hasPointerRef.current) {
        for (const node of nodes) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CURSOR_CONNECTION_DISTANCE) {
            const opacity =
              CURSOR_MAX_OPACITY * scale * (1 - distance / CURSOR_CONNECTION_DISTANCE);
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity})`;
            ctx.lineWidth = CURSOR_LINE_WIDTH;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${LINE_COLOR}, ${CURSOR_MAX_OPACITY * scale})`;
        ctx.fill();
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${LINE_COLOR}, ${NODE_OPACITY * scale})`;
        ctx.fill();
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    hasPointerRef.current = window.matchMedia("(pointer: fine)").matches;

    const pointerQuery = window.matchMedia("(pointer: fine)");
    const handlePointerChange = (e: MediaQueryListEvent) => {
      hasPointerRef.current = e.matches;
    };
    pointerQuery.addEventListener("change", handlePointerChange);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initializeCanvas = () => {
      const { newWidth, newHeight } = syncCanvasSize(canvas);
      if (newWidth > 0 && newHeight > 0 && !initializedRef.current) {
        initializedRef.current = true;
        nodesRef.current = createNodes(newWidth, newHeight);
      }
    };

    // Try to initialize immediately
    initializeCanvas();

    // Use ResizeObserver to handle cases where canvas has zero dimensions
    // on initial mount (e.g., during page refresh before layout is computed)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          if (!initializedRef.current) {
            initializeCanvas();
          } else {
            // Handle resize after initialization
            const prevWidth = sizeRef.current.width;
            const prevHeight = sizeRef.current.height;
            const { newWidth, newHeight } = syncCanvasSize(canvas);

            if (newWidth > 0 && newHeight > 0 && prevWidth > 0 && prevHeight > 0) {
              const scaleX = newWidth / prevWidth;
              const scaleY = newHeight / prevHeight;

              for (const node of nodesRef.current) {
                node.x *= scaleX;
                node.y *= scaleY;
                node.x = Math.max(0, Math.min(newWidth, node.x));
                node.y = Math.max(0, Math.min(newHeight, node.y));
              }
            } else if (newWidth > 0 && newHeight > 0) {
              nodesRef.current = createNodes(newWidth, newHeight);
            }
          }
        }
      }
    });

    resizeObserver.observe(canvas);

    const animate = () => {
      draw(ctx);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      pointerQuery.removeEventListener("change", handlePointerChange);
      initializedRef.current = false;
    };
  }, [syncCanvasSize, draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}
