"use client";

import { useEffect, useRef, useState } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Observes an element's box and returns its px size, `{0,0}` until measured.
 *
 * The Spotlight board lays its cloud out in normalised 0–1 space precisely so
 * it can be projected onto whatever the board measures — which means the force
 * simulation needs the real box, not a hardcoded canvas constant, and needs to
 * hear about resizes.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      // Round to whole px: sub-pixel jitter would otherwise restart the
      // simulation on every fractional layout change.
      setSize((prev) => {
        const width = Math.round(box.width);
        const height = Math.round(box.height);
        return prev.width === width && prev.height === height
          ? prev
          : { width, height };
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
