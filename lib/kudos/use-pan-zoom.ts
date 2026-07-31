"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

export interface PanZoomTransform {
  x: number;
  y: number;
  scale: number;
}

export interface UsePanZoomOptions {
  /** Minimum allowed zoom scale (default 0.5). */
  minScale?: number;
  /** Maximum allowed zoom scale (default 2.5). */
  maxScale?: number;
  /** Starting zoom scale (default 1). */
  initialScale?: number;
  /** Scale delta applied by the zoomIn/zoomOut controls (default 0.2). */
  zoomStep?: number;
}

export interface UsePanZoomResult {
  /** Attach to the pannable/zoomable viewport element. */
  viewportRef: RefObject<HTMLDivElement | null>;
  /** Current translate/scale — apply as a CSS transform on the inner canvas. */
  transform: PanZoomTransform;
  /** True while a drag is in progress (for cursor styling). */
  isPanning: boolean;
  /** Spread onto the viewport element's onPointerDown. */
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  /** Reset pan + zoom back to the initial transform. */
  reset: () => void;
}

const DEFAULT_MIN_SCALE = 0.5;
const DEFAULT_MAX_SCALE = 2.5;
const DEFAULT_ZOOM_STEP = 0.2;
const WHEEL_ZOOM_SENSITIVITY = 0.001;

/**
 * Click-drag pan + wheel-to-cursor zoom, via CSS transforms so there is no
 * per-frame React re-layout.
 */
export function usePanZoom(options: UsePanZoomOptions = {}): UsePanZoomResult {
  const {
    minScale = DEFAULT_MIN_SCALE,
    maxScale = DEFAULT_MAX_SCALE,
    initialScale = 1,
    zoomStep = DEFAULT_ZOOM_STEP,
  } = options;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [transform, setTransform] = useState<PanZoomTransform>({
    x: 0,
    y: 0,
    scale: initialScale,
  });
  const [isPanning, setIsPanning] = useState(false);

  const clampScale = useCallback(
    (scale: number) => Math.min(maxScale, Math.max(minScale, scale)),
    [minScale, maxScale],
  );

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.x,
      originY: transform.y,
    };
    setIsPanning(true);
  }, [transform.x, transform.y]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof window === "undefined") return undefined;

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      setTransform((prev) => ({
        ...prev,
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      }));
    };

    const handlePointerUp = () => {
      dragState.current = null;
      setIsPanning(false);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      setTransform((prev) => {
        const nextScale = clampScale(prev.scale - event.deltaY * WHEEL_ZOOM_SENSITIVITY * prev.scale);
        if (nextScale === prev.scale) return prev;
        const ratio = nextScale / prev.scale;
        return {
          scale: nextScale,
          x: cursorX - (cursorX - prev.x) * ratio,
          y: cursorY - (cursorY - prev.y) * ratio,
        };
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [clampScale]);

  const zoomBy = useCallback(
    (delta: number) => {
      setTransform((prev) => ({ ...prev, scale: clampScale(prev.scale + delta) }));
    },
    [clampScale],
  );

  const zoomIn = useCallback(() => zoomBy(zoomStep), [zoomBy, zoomStep]);
  const zoomOut = useCallback(() => zoomBy(-zoomStep), [zoomBy, zoomStep]);
  const reset = useCallback(
    () => setTransform({ x: 0, y: 0, scale: initialScale }),
    [initialScale],
  );

  return { viewportRef, transform, isPanning, onPointerDown, zoomIn, zoomOut, reset };
}
