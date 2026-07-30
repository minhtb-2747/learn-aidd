"use client";

import { useEffect, useState } from "react";
import type { SpotlightName } from "@/lib/kudos/spotlight-layout";

export interface SpotlightMetrics {
  /** Rendered width in px of each label, index-aligned with `names`. */
  widths: number[];
  /** Resolved canvas `font` family string, e.g. `"__Montserrat_abc123", sans-serif`. */
  fontFamily: string;
}

/** Weight the labels are painted at; must match what `measureText` is told. */
export const LABEL_FONT_WEIGHT = 600;

const FALLBACK_FAMILY = "sans-serif";

/**
 * Measures every label once with an offscreen 2D context.
 *
 * Two things make this worth a hook rather than an inline estimate. Canvas
 * hit-testing needs a real box — a glyph-ratio guess mislocates the hover
 * target on short or diacritic-heavy names. And `forceCollide` sized from the
 * true width keeps names from overlapping far better than an average.
 *
 * Measurement waits on `document.fonts.ready`: Montserrat arrives via
 * `next/font`, and measuring before it lands returns fallback-face widths that
 * are wrong by enough to matter.
 */
export function useSpotlightMetrics(
  names: SpotlightName[],
  typeScale: number,
): SpotlightMetrics | null {
  const [metrics, setMetrics] = useState<SpotlightMetrics | null>(null);

  useEffect(() => {
    if (typeof document === "undefined" || names.length === 0) return undefined;

    let cancelled = false;

    // `next/font` exposes the generated family through this custom property;
    // there is no stable literal name to hardcode.
    const declared = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-montserrat")
      .trim();
    const fontFamily = declared ? `${declared}, ${FALLBACK_FAMILY}` : FALLBACK_FAMILY;

    function measure() {
      if (cancelled) return;
      const context = document.createElement("canvas").getContext("2d");
      if (!context) return;

      const widths = names.map((item) => {
        context.font = `${LABEL_FONT_WEIGHT} ${item.fontSize * typeScale}px ${fontFamily}`;
        return context.measureText(item.name).width;
      });
      setMetrics({ widths, fontFamily });
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    } else {
      measure();
    }

    return () => {
      cancelled = true;
    };
  }, [names, typeScale]);

  return metrics;
}
