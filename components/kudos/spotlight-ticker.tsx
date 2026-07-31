"use client";

import { useTranslations } from "next-intl";
import type { TickerLine } from "@/lib/kudos/types";

export interface SpotlightTickerProps {
  /** Recent kudos receipts, newest first. */
  lines: TickerLine[];
}

/**
 * Opacity ramp from the design: the two newest lines are solid, older ones fade,
 * so the block reads as a trail rather than a list. Lines past it aren't rendered.
 */
const OPACITY_RAMP = [1, 1, 0.7, 0.5, 0.3, 0.1];

/**
 * "Recent activity" trail, bottom-left of the board. The timestamp is its own
 * fixed-width column rather than an inline prefix, which is what keeps the
 * messages left-aligned with each other.
 */
export default function SpotlightTicker({ lines }: SpotlightTickerProps) {
  const t = useTranslations("Kudos.spotlight");

  return (
    <div className="pointer-events-none absolute bottom-5 left-6 flex flex-col gap-0.5 sm:left-12">
      {lines.slice(0, OPACITY_RAMP.length).map((line, index) => (
        <p
          key={line.id}
          className="flex gap-3 text-xs leading-[19px] font-bold whitespace-nowrap sm:text-sm"
          style={{ opacity: OPACITY_RAMP[index] }}
        >
          <span className="w-16 shrink-0 text-[#999999]">{line.time}</span>
          <span className="text-white">{t("tickerText", { name: line.name })}</span>
        </p>
      ))}
    </div>
  );
}
