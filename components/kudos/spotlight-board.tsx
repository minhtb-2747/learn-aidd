"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";
import { usePanZoom } from "@/lib/kudos/use-pan-zoom";
import {
  ACTIVITY_TICKER,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  HIGHLIGHT_TEXT_COLOR,
  SPOTLIGHT_NAMES,
} from "@/lib/kudos/spotlight-names";

export interface SpotlightBoardProps {
  /** e.g. "388 KUDOS" — rendered as the board header. */
  totalLabel: string;
  /** e.g. "Tìm kiếm" — the search input placeholder. */
  searchPlaceholder: string;
}

/** "Expand/pan-zoom" glyph, matches the design's control icon (B.7.2). Kept local — not a shared icon. */
function PanZoomIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small magnifier glyph for the search bar. Kept local — not a shared icon. */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Interactive pan/zoom word-cloud of Sunner names (Sun* Kudos "Spotlight board",
 * MoMorph node 2940:14174). All names/ticker lines are mock data owned locally
 * (lib/kudos/spotlight-names.ts) — not accepted via props.
 */
export default function SpotlightBoard({
  totalLabel,
  searchPlaceholder,
}: SpotlightBoardProps) {
  const t = useTranslations("Kudos.spotlight");
  const [searchValue, setSearchValue] = useState("");
  const {
    viewportRef,
    transform,
    isPanning,
    onPointerDown,
    zoomIn,
    zoomOut,
    reset,
  } = usePanZoom();

  return (
    <section
      aria-label={t("board")}
      className="relative h-[360px] w-full overflow-hidden rounded-[47px] border border-gold-line bg-[#00101A] sm:h-[420px] lg:h-[480px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-orange-500/25 via-red-500/15 to-teal-400/15 blur-3xl"
      />

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        role="presentation"
        className={cn(
          "absolute inset-0 touch-none select-none",
          isPanning ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {SPOTLIGHT_NAMES.map((item) => (
            <span
              key={item.id}
              className="group absolute inline-block whitespace-nowrap font-semibold text-white/90"
              style={{
                left: item.x,
                top: item.y,
                fontSize: item.fontSize,
                color: item.highlight ? HIGHLIGHT_TEXT_COLOR : undefined,
              }}
            >
              {item.name}
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                {item.name} · nhận Kudos lúc {item.receivedAt}
              </span>
            </span>
          ))}
        </div>
      </div>

      <h2 className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-2xl font-bold text-white sm:top-6 sm:text-4xl">
        {totalLabel}
      </h2>

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#998C5F] bg-[#FFEA9E1A] px-4 py-2 sm:left-6 sm:top-6">
        <SearchIcon className="h-4 w-4 shrink-0 text-white/70" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-28 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none sm:w-44"
        />
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={zoomOut}
          aria-label={t("zoomOut")}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#998C5F] bg-black/40 text-sm text-white hover:bg-black/60"
        >
          −
        </button>
        <button
          type="button"
          onClick={zoomIn}
          aria-label={t("zoomIn")}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#998C5F] bg-black/40 text-sm text-white hover:bg-black/60"
        >
          +
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label={t("resetView")}
          title={t("resetView")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#998C5F] bg-black/40 text-white hover:bg-black/60"
        >
          <PanZoomIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col-reverse gap-1 sm:left-6">
        {ACTIVITY_TICKER.map((line, i) => (
          <p
            key={line.id}
            className="text-xs font-bold text-white sm:text-sm"
            style={{ opacity: 1 - i * 0.18 }}
          >
            {line.time} {line.name} đã nhận được một Kudos mới
          </p>
        ))}
      </div>
    </section>
  );
}
