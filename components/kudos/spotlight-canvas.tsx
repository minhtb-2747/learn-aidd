"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { PanZoomTransform } from "@/lib/kudos/use-pan-zoom";
import {
  HIGHLIGHT_TEXT_COLOR,
  type SpotlightEdge,
  type SpotlightName,
} from "@/lib/kudos/spotlight-layout";
import {
  LABEL_FONT_WEIGHT,
  type SpotlightMetrics,
} from "@/lib/kudos/use-spotlight-metrics";
import type { SpotlightNode } from "@/lib/kudos/use-spotlight-force";

export interface SpotlightCanvasProps {
  names: SpotlightName[];
  edges: SpotlightEdge[];
  /** Live simulation nodes — read on every draw, never copied into state. */
  nodesRef: React.RefObject<SpotlightNode[] | null>;
  metrics: SpotlightMetrics | null;
  typeScale: number;
  transform: PanZoomTransform;
  width: number;
  height: number;
  /** Lower-cased search query; non-matching names are drawn faded. */
  query: string;
  hoveredIndex: number | null;
  /** Registers the imperative redraw so the force tick can call it directly. */
  onReady: (draw: () => void) => void;
}

const LINE_COLOR = "rgba(255, 255, 255, 0.16)";
/** Constant on-screen thickness, in CSS px, regardless of zoom. */
const LINE_WIDTH = 0.8;
const LABEL_COLOR = "rgba(255, 255, 255, 0.9)";
const DIMMED_ALPHA = 0.15;
/** Past 2 the extra backing-store pixels cost real frame time and buy nothing. */
const MAX_DPR = 2;

/**
 * The whole board in one canvas: the plexus the design ships as a static
 * texture, plus every Sunner name as a vertex of it.
 *
 * The names were DOM `<span>`s at first, which is what made the board stutter.
 * Writing `style.transform` on ~100 elements every frame forces a style
 * recalc and repaint over all of them, and panning re-rendered the same 100
 * elements through React on every `pointermove`. Painting them here costs one
 * `fillText` each with no DOM work at all, so a frame is a few hundred
 * microseconds instead of tens of milliseconds.
 *
 * The canvas also sits *outside* the pan/zoom transformed element and
 * re-applies that transform through `setTransform`: scaling a canvas with CSS
 * resamples its bitmap and leaves both hairlines and text blurred at any zoom
 * above 1.
 */
export default function SpotlightCanvas({
  names,
  edges,
  nodesRef,
  metrics,
  typeScale,
  transform,
  width,
  height,
  query,
  hoveredIndex,
  onReady,
}: SpotlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The force tick fires far more often than React renders, so the draw
  // closure reads volatile inputs from a ref rather than capturing stale props.
  const liveRef = useRef({ transform, query, hoveredIndex });
  useEffect(() => {
    liveRef.current = { transform, query, hoveredIndex };
  });

  // Assigning `ctx.font` re-parses the font shorthand, so labels are painted
  // in runs of equal size — there are only three sizes in the whole cloud.
  const sizeGroups = useMemo(() => {
    const groups = new Map<number, number[]>();
    names.forEach((item, index) => {
      const bucket = groups.get(item.fontSize);
      if (bucket) bucket.push(index);
      else groups.set(item.fontSize, [index]);
    });
    return [...groups.entries()];
  }, [names]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const nodes = nodesRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !nodes || nodes.length === 0 || !metrics) return;

    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const { transform: view, query: search, hoveredIndex: hovered } = liveRef.current;
    const { x, y, scale } = view;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    context.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * x, dpr * y);

    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_WIDTH / scale;
    context.beginPath();
    for (const edge of edges) {
      const from = nodes[edge.source];
      const to = nodes[edge.target];
      if (!from || !to) continue;
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
    }
    context.stroke();

    context.textAlign = "center";
    context.textBaseline = "middle";
    for (const [fontSize, indices] of sizeGroups) {
      context.font = `${LABEL_FONT_WEIGHT} ${fontSize * typeScale}px ${metrics.fontFamily}`;
      for (const index of indices) {
        const node = nodes[index];
        const item = names[index];
        if (!node) continue;
        const dimmed = search.length > 0 && !item.name.toLowerCase().includes(search);
        context.globalAlpha = dimmed ? DIMMED_ALPHA : 1;
        context.fillStyle =
          index === hovered && !dimmed
            ? "#FFFFFF"
            : item.highlight
              ? HIGHLIGHT_TEXT_COLOR
              : LABEL_COLOR;
        context.fillText(item.name, node.x, node.y);
      }
    }
    context.globalAlpha = 1;
  }, [edges, names, nodesRef, metrics, sizeGroups, typeScale]);

  // Every repaint request is coalesced into at most one per animation frame.
  // Without this a pan paints twice per frame: gaming mice fire `pointermove`
  // well above 60Hz, and each one lands a transform change on top of the
  // simulation tick that was already going to repaint anyway.
  const frameRef = useRef<number | null>(null);
  const requestDraw = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  // Sizing is kept apart from repainting on purpose: assigning `canvas.width`
  // reallocates the backing store and clears it, so folding this into the
  // repaint effect would do that on every frame of a pan.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    requestDraw();
  }, [requestDraw, width, height]);

  // Covers pan, zoom, search and hover — and the reduced-motion case, where
  // the simulation never runs and nothing else would trigger a repaint.
  useEffect(() => {
    requestDraw();
  }, [requestDraw, transform, query, hoveredIndex]);

  useEffect(() => {
    onReady(requestDraw);
  }, [onReady, requestDraw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
