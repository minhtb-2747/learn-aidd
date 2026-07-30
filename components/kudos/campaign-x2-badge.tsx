"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn.utils";

const ICON_SRC = "/images/kudos/campain-x2.svg";
const TOOLTIP_WIDTH = 320;
const TITLE = "Ngày x2 tim – lan tỏa gấp đôi yêu thương!";
const DESCRIPTION =
  "Từ XX:XX ngày XX/12 đến XX:XX ngày XX/12, tất cả tim bạn nhận được đều được nhân đôi.";

export interface CampaignX2BadgeProps {
  className?: string;
}

/**
 * The "x2 hearts campaign" icon shown beside the hearts-received stat (Kudos
 * sidebar + profile). Hovering reveals a tooltip explaining the double-hearts
 * event, mirroring the design. The tooltip is fixed-positioned so it escapes
 * the stats card's bounds. Mock copy lives here as local literals.
 */
export default function CampaignX2Badge({ className }: CampaignX2BadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

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
            <p className="text-sm leading-5 font-bold text-white">{TITLE}</p>
            <p className="text-sm leading-5 font-bold text-white/70">
              {DESCRIPTION}
            </p>
          </div>
        </div>
      )}
    </span>
  );
}
