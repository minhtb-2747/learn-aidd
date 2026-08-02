"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { HeartIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";
import { toggleKudoLike } from "@/app/actions/kudos-likes";

export interface KudosHeartButtonProps {
  /** Stringified kudos id (bigint), passed to the `toggleKudoLike` server action. */
  kudoId: string;
  initialLikes: number;
  /** Real per-session liked state (`likedByCurrentUser`), seeds the toggle's first render. */
  initialLiked: boolean;
  /** Hearts one like is worth now (campaign multiplier, else 1). Server-supplied
   * so the optimistic delta matches what the trigger will record. */
  heartMultiplier: number;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
}

/**
 * Like/unlike toggle for a Kudos card or post.
 *
 * The optimistic delta is `heartMultiplier`, NOT a flat 1 — during an x2
 * campaign a flat ±1 makes the counter visibly jump twice (+1 on click, then +2
 * when the server replies). The server's `heartValue` still wins on reconcile,
 * since a campaign could start or end between render and click.
 */
export default function KudosHeartButton({
  kudoId,
  initialLikes,
  initialLiked,
  heartMultiplier,
  likeAriaLabel,
  unlikeAriaLabel,
}: KudosHeartButtonProps) {
  const locale = useLocale();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [, startTransition] = useTransition();

  function toggle() {
    const wasLiked = liked;
    const previousLikes = likes;
    const optimisticDelta = Math.max(1, heartMultiplier);

    // Independent updaters using closure values, so Strict Mode's double
    // invocation can never double-apply the like.
    setLikes((count) => count + (wasLiked ? -optimisticDelta : optimisticDelta));
    setLiked((current) => !current);

    startTransition(async () => {
      const result = await toggleKudoLike(kudoId);
      if (!result.ok) {
        setLiked(wasLiked);
        setLikes(previousLikes);
        return;
      }
      setLiked(result.liked);
      setLikes(result.liked ? previousLikes + result.heartValue : previousLikes - result.heartValue);
    });
  }

  return (
    <button
      type="button"
      data-kudo-id={kudoId}
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? unlikeAriaLabel : likeAriaLabel}
      className="flex cursor-pointer items-center gap-1 transition-transform duration-150 hover:scale-105"
    >
      <span className="text-base leading-6 font-bold tracking-[0.5px] text-ink">
        {likes.toLocaleString(locale)}
      </span>
      {/* Both surfaces here are the cards' cream background, so the idle heart
          must be a dark tint — `text-white` would be invisible until liked. */}
      <HeartIcon
        className={cn(
          "h-8 w-8 shrink-0 transition-colors duration-150",
          liked ? "text-danger" : "text-ink/30",
        )}
      />
    </button>
  );
}
