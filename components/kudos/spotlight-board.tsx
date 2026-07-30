"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";
import { usePanZoom } from "@/lib/kudos/use-pan-zoom";
import { useElementSize } from "@/lib/kudos/use-element-size";
import {
  buildSpotlightEdges,
  DESIGN_WIDTH,
  type SpotlightName,
} from "@/lib/kudos/spotlight-layout";
import { useSpotlightMetrics } from "@/lib/kudos/use-spotlight-metrics";
import { useSpotlightForce, type SpotlightNode } from "@/lib/kudos/use-spotlight-force";
import { useSpotlightPointer } from "@/lib/kudos/use-spotlight-pointer";
import type { TickerLine } from "@/lib/kudos/types";
import SpotlightCanvas from "./spotlight-canvas";
import SpotlightTicker from "./spotlight-ticker";
import { PanZoomIcon, SpotlightSearchIcon } from "./spotlight-icons";

export interface SpotlightBoardProps {
  /** Real Sunner name-cloud entries, already laid out server-side (`buildSpotlightLayout`). */
  names: SpotlightName[];
  /** The most-recent kudos receipts, newest first. */
  ticker: TickerLine[];
  /** e.g. "55 KUDOS" — the parameterised total, rendered as the board header. */
  totalLabel: string;
  /** e.g. "Tìm kiếm" — the search input placeholder. */
  searchPlaceholder: string;
}

/**
 * Interactive word-cloud of Sunner names (Sun* Kudos "Spotlight board",
 * MoMorph node 2940:14174, design export `SPOTLIGHT_board.svg`).
 *
 * The design layers a keyvisual photo darkened to 30%, then a plexus mesh
 * texture at 30% `screen`. Here that mesh is not a texture: every name is a
 * live vertex of it, drifting under the simulation in `use-spotlight-force.ts`
 * and painted to a single canvas (`spotlight-canvas.tsx`).
 *
 * Nothing about the cloud is in the DOM, which is what keeps it smooth — see
 * the note in `spotlight-canvas.tsx`. The trade is that pointer behaviour and
 * screen readers have to be rebuilt by hand: hover/click are hit-tests against
 * the live node positions (`use-spotlight-pointer.ts`) with one shared tooltip
 * element, and the names are mirrored into a visually-hidden list so assistive
 * tech still reaches them.
 *
 * `names`/`ticker` arrive as plain, server-computed props
 * (`app/kudos/board-data.ts`) — this stays a client component for the
 * pan/zoom, search and simulation, so it must never import a query module.
 */
export default function SpotlightBoard({
  names,
  ticker,
  totalLabel,
  searchPlaceholder,
}: SpotlightBoardProps) {
  const t = useTranslations("Kudos.spotlight");
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { viewportRef, transform, isPanning, onPointerDown, reset } = usePanZoom();
  const { ref: sizeRef, size } = useElementSize<HTMLElement>();

  const edges = useMemo(() => buildSpotlightEdges(names), [names]);

  // The cloud is authored against a 1157px-wide board; on a wider one the
  // normalised positions spread out, so the type scales with it or the names
  // would read as tiny specks adrift.
  const typeScale = size.width
    ? Math.min(1.35, Math.max(0.85, size.width / DESIGN_WIDTH))
    : 1;

  const metrics = useSpotlightMetrics(names, typeScale);

  const nodesRef = useRef<SpotlightNode[] | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const drawRef = useRef<(() => void) | null>(null);
  const registerDraw = useCallback((draw: () => void) => {
    drawRef.current = draw;
  }, []);

  // Repaint and reposition the tooltip imperatively: at 60fps a `setState` per
  // frame is exactly the cost the canvas rewrite exists to remove.
  const handleTick = useCallback((nodes: SpotlightNode[]) => {
    nodesRef.current = nodes;
    drawRef.current?.();

    const tooltip = tooltipRef.current;
    if (!tooltip || tooltip.dataset.index === undefined) return;
    const node = nodes[Number(tooltip.dataset.index)];
    if (!node) return;
    tooltip.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
  }, []);

  useSpotlightForce({
    names,
    edges,
    width: size.width,
    height: size.height,
    widths: metrics?.widths ?? null,
    onTick: handleTick,
  });

  const openProfile = useCallback(
    (profileId: string) => router.push(`/profile/${profileId}`),
    [router],
  );

  const pointer = useSpotlightPointer({
    names,
    nodesRef,
    widths: metrics?.widths ?? null,
    typeScale,
    transform,
    isPanning,
    onOpenProfile: openProfile,
  });

  const query = searchValue.trim().toLowerCase();
  const hovered = pointer.hover === null ? null : names[pointer.hover.index];

  return (
    <section
      ref={sizeRef}
      aria-label={t("board")}
      className="relative h-[360px] w-full overflow-hidden rounded-[47px] border border-gold-line bg-ink sm:h-[440px] lg:h-[548px]"
    >
      {/* Keyvisual, darkened to 30% exactly as the design's black@0.7 layer. */}
      <Image
        src="/images/kudos/spotlight-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover object-left"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/70" />

      <div
        ref={viewportRef}
        onPointerDown={(event) => {
          onPointerDown(event);
          pointer.onPointerDown(event);
        }}
        onPointerMove={pointer.onPointerMove}
        onPointerUp={pointer.onPointerUp}
        onPointerLeave={pointer.clearHover}
        role="presentation"
        className={cn(
          "absolute inset-0 touch-none select-none",
          isPanning
            ? "cursor-grabbing"
            : pointer.hoverIsLink
              ? "cursor-pointer"
              : "cursor-grab",
        )}
      >
        <SpotlightCanvas
          names={names}
          edges={edges}
          nodesRef={nodesRef}
          metrics={metrics}
          typeScale={typeScale}
          transform={transform}
          width={size.width}
          height={size.height}
          query={query}
          hoveredIndex={pointer.hover?.index ?? null}
          onReady={registerDraw}
        />

        {/* One shared tooltip rather than one per name; the force tick moves it
            to follow whichever node is under the cursor. */}
        <div
          className="pointer-events-none absolute top-0 left-0 origin-top-left"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {hovered && pointer.hover && (
            <div
              ref={tooltipRef}
              data-index={pointer.hover.index}
              className="absolute top-0 left-0"
              style={{
                transform: `translate3d(${pointer.hover.x}px, ${pointer.hover.y}px, 0)`,
              }}
            >
              <span className="absolute top-3 left-1/2 -translate-x-1/2 rounded-md bg-black/90 px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg">
                {t("tooltipReceivedAt", { name: hovered.name, time: hovered.receivedAt })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* The cloud itself is canvas-only, so assistive tech gets the names —
          and a real way to reach each profile — from here. */}
      <ul className="sr-only">
        {names.map((item) => (
          <li key={item.id}>
            {item.profileId ? (
              <Link href={`/profile/${item.profileId}`}>
                {t("tooltipReceivedAt", { name: item.name, time: item.receivedAt })}
              </Link>
            ) : (
              t("tooltipReceivedAt", { name: item.name, time: item.receivedAt })
            )}
          </li>
        ))}
      </ul>

      <h2 className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 text-2xl font-bold text-white sm:text-4xl">
        {totalLabel}
      </h2>

      {/* No `backdrop-blur` here: the canvas beneath repaints every frame, and
          a backdrop filter over it would be re-evaluated every frame too. The
          design specifies a flat #FFEA9E @10% fill anyway. */}
      <div className="absolute top-6 left-6 flex h-[39px] items-center gap-3 rounded-full border border-gold-line bg-gold/10 px-[13px]">
        <SpotlightSearchIcon className="h-3 w-3 shrink-0 text-white" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-32 bg-transparent text-[13px] text-white placeholder:text-white/70 focus:outline-none sm:w-44"
        />
      </div>

      <button
        type="button"
        onClick={reset}
        aria-label={t("resetView")}
        title={t("resetView")}
        className="absolute right-6 bottom-12 flex cursor-pointer items-center justify-center text-white/90 transition-opacity hover:opacity-70 sm:right-10"
      >
        <PanZoomIcon className="h-[22px] w-[22px]" />
      </button>

      <SpotlightTicker lines={ticker} />
    </section>
  );
}
