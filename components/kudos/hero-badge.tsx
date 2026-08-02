"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn.utils";
import { HERO_TIERS } from "@/lib/kudos/rules-content";

export interface HeroBadgeProps {
  /** Tier label, e.g. "Legend Hero" — matches `HeroTier.badgeLabel`. */
  badge: string;
  className?: string;
}

interface HeroBadgeAsset {
  src: string;
  /** Intrinsic dimensions of the exported pill (varies per tier). */
  width: number;
  height: number;
}

/**
 * The 4 Hero tier badges, exported as SVG so they stay crisp at any size.
 * `width`/`height` are viewBox dims, i.e. aspect ratio.
 */
const HERO_BADGE_ASSETS: Record<string, HeroBadgeAsset> = {
  "New Hero": { src: "/images/kudos/badge-new-hero.svg", width: 220, height: 40 },
  "Rising Hero": { src: "/images/kudos/badge-rising-hero.svg", width: 220, height: 40 },
  "Super Hero": { src: "/images/kudos/badge-super-hero.svg", width: 218, height: 38 },
  "Legend Hero": { src: "/images/kudos/badge-legend-hero.svg", width: 220, height: 40 },
};

/** Tooltip copy keyed by badge label, reused from the Rules panel. */
const TIER_BY_LABEL = Object.fromEntries(
  HERO_TIERS.map((tier) => [tier.badgeLabel, tier]),
);

const TOOLTIP_WIDTH = 288;

/**
 * A Hero tier badge with a hover tooltip carrying the tier's range and
 * description. The tooltip is FIXED-positioned so it escapes card/carousel
 * `overflow`. Unknown labels render nothing.
 */
export default function HeroBadge({ badge, className }: HeroBadgeProps) {
  const asset = HERO_BADGE_ASSETS[badge];
  const tier = TIER_BY_LABEL[badge];
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  if (!asset) return null;

  function showTooltip() {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    // Clamp so the fixed tooltip stays within the viewport horizontally.
    const left = Math.min(
      Math.max(rect.left, 8),
      window.innerWidth - TOOLTIP_WIDTH - 8,
    );
    setPos({ top: rect.bottom + 8, left });
  }

  return (
    <span
      ref={ref}
      className={cn("relative inline-flex", className)}
      onMouseEnter={tier ? showTooltip : undefined}
      onMouseLeave={() => setPos(null)}
    >
      <Image
        src={asset.src}
        alt={badge}
        width={asset.width}
        height={asset.height}
        className="h-[22px] w-auto"
      />

      {tier && pos && (
        <div
          role="tooltip"
          style={{ top: pos.top, left: pos.left, width: TOOLTIP_WIDTH }}
          className="pointer-events-none fixed z-[60] flex flex-col gap-2 rounded-2xl border border-gold-line/40 bg-[#00101A] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <Image
            src={asset.src}
            alt=""
            width={asset.width}
            height={asset.height}
            className="h-6 w-auto self-start"
          />
          <p className="text-sm leading-5 font-bold text-white">
            {tier.rangeLabel}
          </p>
          <p className="text-sm leading-5 font-bold text-white/70">
            {tier.description}
          </p>
        </div>
      )}
    </span>
  );
}
