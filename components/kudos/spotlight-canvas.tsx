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
 * Canvas, not DOM `<span>`s: writing `style.transform` on ~100 elements per
 * frame forces a style recalc and repaint over all of them. One `fillText` each
 * makes a frame hundreds of microseconds instead of tens of milliseconds.
 *
 * The canvas sits OUTSIDE the pan/zoom element and re-applies the transform via
 * `setTransform` — scaling a canvas with CSS resamples its bitmap and blurs
 * hairlines and text at any zoom above 1.
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

  // The tick fires far more often than React renders, so the draw closure reads
  // volatile inputs from a ref rather than capturing stale props.
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

  // Coalesce repaints to one per frame. Without it a pan paints twice: mice
  // fire `pointermove` above 60Hz, on top of the tick already repainting.
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

  // Kept apart from repainting: assigning `canvas.width` reallocates and clears
  // the backing store, which folded into the repaint effect means every frame.
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
