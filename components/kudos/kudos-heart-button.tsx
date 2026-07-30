"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { HeartIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";

export interface KudosHeartButtonProps {
  initialLikes: number;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
}

/**
 * Like/unlike toggle for a Kudos card or post (spec C.4.1 / B.4.4). Local
 * state only — no backend to persist the like, so it resets on reload.
 * Idle: gray heart. Liked: red heart (`text-danger`) + count +1.
 */
export default function KudosHeartButton({
  initialLikes,
  likeAriaLabel,
  unlikeAriaLabel,
}: KudosHeartButtonProps) {
  const locale = useLocale();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  function toggle() {
    // Independent updater calls (no setState nested inside another updater):
    // use the current `liked` closure value for the delta so Strict Mode's
    // double-invocation can never double-apply the like.
    setLikes((count) => count + (liked ? -1 : 1));
    setLiked((wasLiked) => !wasLiked);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? unlikeAriaLabel : likeAriaLabel}
      className="flex cursor-pointer items-center gap-1 transition-transform duration-150 hover:scale-105"
    >
      <span className="text-base leading-6 font-bold tracking-[0.5px] text-ink">
        {likes.toLocaleString(locale)}
      </span>
      <HeartIcon
        className={cn(
          "h-8 w-8 shrink-0 transition-colors duration-150",
          liked ? "text-danger" : "text-white",
        )}
      />
    </button>
  );
}
