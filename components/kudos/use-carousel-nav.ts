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
 * Read through `useSyncExternalStore`, not mirrored into `useState` in an
 * effect — that is correctness, not style: Embla emits "init" during its own
 * setup (before any effect runs), so an event-only subscription leaves
 * `canPrev`/`canNext` stuck at `false` and both arrows permanently disabled.
 *
 * Embla reads `startIndex` once at init, so changing it later does nothing —
 * callers needing a reset must remount.
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

  // Falling back to `startIndex` rather than 0 keeps server, pre-init and
  // post-init renders agreeing — otherwise "n/total" paints "1/5" then flips
  // to "2/5" the moment Embla wakes.
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
