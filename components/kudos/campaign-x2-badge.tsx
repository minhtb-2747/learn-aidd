"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";
import { formatKudosTime } from "@/lib/kudos/format-kudos-time";

const ICON_SRC = "/images/kudos/campain-x2.svg";
const TOOLTIP_WIDTH = 320;

export interface CampaignX2BadgeProps {
  /** Real multiplier from the active campaign row, e.g. `2`. */
  heartMultiplier: number;
  /** ISO campaign start, formatted into the tooltip window via `formatKudosTime`. */
  startDate: string;
  /** ISO campaign end, formatted into the tooltip window via `formatKudosTime`. */
  endDate: string;
  className?: string;
}

/**
 * The "x2 hearts campaign" icon shown beside the hearts-received stat (Kudos
 * sidebar + profile). Hovering reveals a tooltip explaining the double-hearts
 * event, mirroring the design. The tooltip is fixed-positioned so it escapes
 * the stats card's bounds. The caller (`KudosSidebar`) only renders this
 * component while `getActiveCampaign()` returns a non-null campaign.
 */
export default function CampaignX2Badge({
  heartMultiplier,
  startDate,
  endDate,
  className,
}: CampaignX2BadgeProps) {
  const t = useTranslations("Kudos.campaignBadge");
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const title = t("title", { multiplier: heartMultiplier });
  const description = t("description", {
    start: formatKudosTime(startDate),
    end: formatKudosTime(endDate),
  });

  function showTooltip() {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
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
      onMouseEnter={showTooltip}
      onMouseLeave={() => setPos(null)}
    >
      <Image
        src={ICON_SRC}
        alt="x2"
        width={57}
        height={67}
        className="h-8 w-auto"
      />

      {pos && (
        <div
          role="tooltip"
          style={{ top: pos.top, left: pos.left, width: TOOLTIP_WIDTH }}
          className="pointer-events-none fixed z-[60] flex items-start gap-3 rounded-2xl border border-gold-line/40 bg-[#00101A] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <Image
            src={ICON_SRC}
            alt=""
            width={57}
            height={67}
            className="h-14 w-auto shrink-0"
          />
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-5 font-bold text-white">{title}</p>
            <p className="text-sm leading-5 font-bold text-white/70">
              {description}
            </p>
          </div>
        </div>
      )}
    </span>
  );
}
