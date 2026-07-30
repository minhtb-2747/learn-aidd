"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { SpotlightName } from "@/lib/kudos/spotlight-layout";
import type { PanZoomTransform } from "@/lib/kudos/use-pan-zoom";
import type { SpotlightNode } from "@/lib/kudos/use-spotlight-force";

/** The hovered label plus where it was when hover began. */
export interface SpotlightHover {
  index: number;
  x: number;
  y: number;
}

export interface UseSpotlightPointerOptions {
  names: SpotlightName[];
  /** Live simulation nodes; `null` until the first frame. */
  nodesRef: React.RefObject<SpotlightNode[] | null>;
  /** Measured label widths, index-aligned with `names`. */
  widths: number[] | null;
  typeScale: number;
  transform: PanZoomTransform;
  isPanning: boolean;
  /** Called with a profile id when a label is clicked (never for a drag). */
  onOpenProfile: (profileId: string) => void;
}

/**
 * A drag that ends within this many CSS px of where it started counts as a
 * click. Zero would misfire constantly — a press-and-release always jitters by
 * a pixel or two, and the board's own drift means the label has moved under
 * the cursor even if the cursor itself held perfectly still.
 */
const CLICK_SLOP_PX = 4;

/**
 * Hover + click behaviour for the canvas word-cloud.
 *
 * The names are painted to a canvas rather than laid out as DOM, so there are
 * no elements to attach listeners to and both have to be derived by hit-testing
 * the live node boxes in board space.
 *
 * Click is deliberately not a `click` handler: the board is drag-to-pan, and
 * the browser fires `click` at the end of a drag too, so panning across the
 * cloud would fling the viewer onto a random profile. Tracking the pointer-down
 * position and requiring the release to land within `CLICK_SLOP_PX` separates
 * the two intents.
 */
export function useSpotlightPointer({
  names,
  nodesRef,
  widths,
  typeScale,
  transform,
  isPanning,
  onOpenProfile,
}: UseSpotlightPointerOptions) {
  const [hover, setHover] = useState<SpotlightHover | null>(null);
  const pressRef = useRef<{ x: number; y: number } | null>(null);

  /** Index of the label under a client-space point, or -1. */
  const hitTest = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const nodes = nodesRef.current;
      if (!nodes || !widths) return -1;

      const px = (clientX - rect.left - transform.x) / transform.scale;
      const py = (clientY - rect.top - transform.y) / transform.scale;

      for (let i = 0; i < nodes.length; i += 1) {
        const halfWidth = (widths[i] ?? 0) / 2;
        const halfHeight = names[i].fontSize * typeScale * 0.7;
        if (
          Math.abs(px - nodes[i].x) <= halfWidth &&
          Math.abs(py - nodes[i].y) <= halfHeight
        ) {
          return i;
        }
      }
      return -1;
    },
    [names, nodesRef, widths, typeScale, transform],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isPanning) return;
      const nodes = nodesRef.current;
      if (!nodes) return;

      const index = hitTest(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect(),
      );

      setHover((prev) => {
        if (index < 0) return prev === null ? prev : null;
        if (prev?.index === index) return prev;
        return { index, x: nodes[index].x, y: nodes[index].y };
      });
    },
    [hitTest, isPanning, nodesRef],
  );

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    pressRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const press = pressRef.current;
      pressRef.current = null;
      if (!press) return;
      if (
        Math.abs(event.clientX - press.x) > CLICK_SLOP_PX ||
        Math.abs(event.clientY - press.y) > CLICK_SLOP_PX
      ) {
        return;
      }

      const index = hitTest(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect(),
      );
      // An anonymous sender has no profile to open.
      const profileId = index < 0 ? null : names[index].profileId;
      if (profileId) onOpenProfile(profileId);
    },
    [hitTest, names, onOpenProfile],
  );

  const clearHover = useCallback(() => setHover(null), []);

  /** True only when the hovered name actually leads somewhere. */
  const hoverIsLink =
    hover !== null && names[hover.index]?.profileId !== null;

  return {
    hover,
    hoverIsLink,
    clearHover,
    onPointerMove,
    onPointerDown,
    onPointerUp,
  };
}
