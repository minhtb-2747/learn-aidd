"use client";

import { useCallback, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";

export interface CarouselNav {
  /** Attach to the element that should clip the track (Embla's viewport). */
  viewportRef: ReturnType<typeof useEmblaCarousel>[0];
  /** Index of the centred slide — drives the active/dimmed styling. */
  selected: number;
  canPrev: boolean;
  canNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
}

/**
 * Embla wiring for the highlight carousel: exposes the viewport ref plus the
 * selected index and edge state the controls need.
 *
 * `align: "center"` with `containScroll: false` is what produces the design's
 * symmetric peek — the default `containScroll` snaps the first and last slides
 * flush to the viewport edges, which loses the neighbour preview.
 *
 * Embla is read through `useSyncExternalStore` rather than mirrored into
 * `useState` inside an effect. That matters for correctness, not just style:
 * Embla emits "init" during its own setup (before any effect runs) and "reInit"
 * only on a genuine re-initialisation, so an event-only subscription leaves
 * `canPrev`/`canNext` stuck at their initial `false` — which renders both
 * arrows disabled and makes the carousel unclickable. Reading the snapshot
 * during render gets the true value immediately, and it keeps
 * `react-hooks/set-state-in-effect` satisfied.
 *
 * `startIndex` is the slide the carousel opens on. Embla reads it once at
 * init, so changing it later has no effect — callers that need a reset should
 * remount instead (the highlight carousel already does that per filter).
 */
export function useCarouselNav(startIndex = 0): CarouselNav {
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    skipSnaps: false,
    startIndex,
  });

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", onChange).on("reInit", onChange);
      return () => {
        emblaApi.off("select", onChange).off("reInit", onChange);
      };
    },
    [emblaApi],
  );

  // Snapshots return primitives, so referential stability is automatic.
  // Falling back to `startIndex` rather than 0 keeps the server render, the
  // pre-init client render and the post-init value agreeing — otherwise the
  // "n/total" readout paints "1/5" and flips to "2/5" the moment Embla wakes.
  const selected = useSyncExternalStore(
    subscribe,
    () => emblaApi?.selectedScrollSnap() ?? startIndex,
    () => startIndex,
  );
  const canPrev = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false,
  );
  const canNext = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollNext() ?? false,
    () => false,
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return { viewportRef, selected, canPrev, canNext, scrollPrev, scrollNext };
}
