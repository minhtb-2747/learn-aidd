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
  /**
   * Hearts one like is worth right now — the active campaign's multiplier, or
   * 1 when no campaign is running. Supplied by the server so the optimistic
   * delta matches what the trigger will actually record.
   */
  heartMultiplier: number;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
}

/**
 * Like/unlike toggle for a Kudos card or post (spec C.4.1 / B.4.4).
 *
 * The optimistic delta is `heartMultiplier`, NOT a flat 1. During an x2
 * campaign a like is worth 2 hearts, so a flat ±1 made the counter visibly
 * jump twice — +1 on click, then +2 once the server replied with its real
 * `heartValue`. Starting from the multiplier lands on the final number
 * immediately.
 *
 * The server's `heartValue` still wins on reconcile: it is authoritative, and
 * a campaign could start or end between render and click. On failure the
 * pre-click state is restored, and the action's `revalidatePath` refreshes
 * `initialLikes`/`initialLiked` on the next render regardless.
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
    // A like is worth `heartMultiplier` hearts, so the optimistic delta must
    // be the multiplier — otherwise the count lands on the wrong number and
    // then visibly corrects itself when the server replies.
    const optimisticDelta = Math.max(1, heartMultiplier);

    // Independent updater calls (no setState nested inside another
    // updater): use the current closure values for the delta so Strict
    // Mode's double-invocation can never double-apply the like.
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
      {/* Both surfaces that render this button are the cards' cream
          (#FFF8E1) background, so the idle heart must be a dark tint —
          `text-white` made it effectively invisible until you liked it. */}
      <HeartIcon
        className={cn(
          "h-8 w-8 shrink-0 transition-colors duration-150",
          liked ? "text-danger" : "text-ink/30",
        )}
      />
    </button>
  );
}
