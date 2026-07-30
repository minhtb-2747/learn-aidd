"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";

export interface CarouselArrowButtonProps {
  direction: "prev" | "next";
  /** `edge` = the large chevron overlaying the track; `inline` = the small one in the pagination row. */
  size: "edge" | "inline";
  disabled: boolean;
  ariaLabel: string;
  onClick: () => void;
  className?: string;
}

/**
 * Carousel previous/next control.
 *
 * The design uses the SAME chevron glyph at two sizes — large ones overlaying
 * the left/right edges of the card track, and small ones flanking the "n/5"
 * pagination readout (see the note on `ArrowLeftIcon`). One component covers
 * both so the two never drift apart.
 */
export default function CarouselArrowButton({
  direction,
  size,
  disabled,
  ariaLabel,
  onClick,
  className,
}: CarouselArrowButtonProps) {
  const Icon = direction === "prev" ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-all duration-150",
        "enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-25",
        size === "edge" ? "h-16 w-16" : "h-9 w-9",
        className,
      )}
    >
      {/* 60px box renders the 24-unit glyph at the design's ~19×30px. */}
      <Icon className={size === "edge" ? "h-15 w-15" : "h-6 w-6"} />
    </button>
  );
}
