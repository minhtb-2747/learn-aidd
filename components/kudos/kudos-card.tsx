import { ArrowUpRightIcon, SendIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";
import type { HighlightKudos } from "@/lib/kudos/types";
import KudosPersonInfo from "./kudos-person-info";
import KudosHeartButton from "./kudos-heart-button";
import CopyLinkButton from "./copy-link-button";

export interface KudosCardProps {
  kudos: HighlightKudos;
  /** Hearts one like is worth right now (active campaign multiplier, else 1). */
  heartMultiplier: number;
  viewDetailLabel: string;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
  className?: string;
}

/**
 * "HIGHLIGHT KUDOS" carousel card (MoMorph B.3/B.4, spec item `B.3`): sender
 * → receiver info, timestamp + department tag, 3-line-clamped content,
 * hashtags, like + copy-link + "Xem chi tiết" action row. `className` lets
 * the carousel drive the center-prominent / side-faded visual state.
 */
export default function KudosCard({
  kudos,
  heartMultiplier,
  viewDetailLabel,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
  className,
}: KudosCardProps) {
  return (
    <article
      className={cn(
        "flex w-full max-w-132 shrink-0 flex-col gap-4 rounded-2xl border-4 border-gold bg-[#FFF8E1] px-6 pt-6 pb-4 transition-all duration-300 ease-out",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <KudosPersonInfo person={kudos.sender} />
        <SendIcon className="mt-4 h-8 w-8 shrink-0 text-ink/70" />
        <KudosPersonInfo person={kudos.receiver} />
      </div>

      <div className="h-px w-full bg-gold" aria-hidden="true" />

      {/* Left-aligned timestamp, centred honor title, then the content panel —
          the block used to be `items-end`, which right-aligned all three. */}
      <div className="flex flex-col gap-4">
        <span className="text-base leading-6 font-bold tracking-[0.5px] text-[#999999]">
          {kudos.time}
        </span>
        {/* Plain centred text — the design has no pill behind the title. */}
        <p className="text-center text-lg leading-7 font-bold tracking-[0.5px] text-ink">
          {kudos.title}
        </p>
        {/* Fixed 120px panel with a 1px gold hairline, per the design export
            (rect 480×120, rx 12, fill #FFEA9E @40%, stroke #FFEA9E) — the
            border was missing and the box used to grow with the text, which
            left cards in the carousel at uneven heights.
            The clamped <p> must NOT itself be the flex item: a flex item's
            `display` is blockified, which turns line-clamp's
            `display:-webkit-box` into `flow-root` and silently kills the
            ellipsis (the text just gets cropped mid-line). The inner wrapper
            absorbs that so the clamp keeps working while the text centres. */}
        <div className="flex h-30 items-center rounded-xl border border-gold bg-gold/40 px-6">
          <div className="w-full">
            <p className="line-clamp-3 text-lg leading-8 font-bold tracking-[0.5px] text-ink">
              {kudos.content}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {kudos.hashtags.map((tag) => (
            <span
              key={tag}
              className="text-base leading-6 font-bold tracking-[0.1px] text-danger"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-gold" aria-hidden="true" />

      <div className="flex items-center justify-between gap-6">
        <KudosHeartButton
          kudoId={kudos.id}
          initialLikes={kudos.likes}
          initialLiked={kudos.likedByCurrentUser}
          heartMultiplier={heartMultiplier}
          likeAriaLabel={likeAriaLabel}
          unlikeAriaLabel={unlikeAriaLabel}
        />
        <div className="flex items-center gap-2">
          <CopyLinkButton
            label={copyLinkLabel}
            toastMessage={toastMessage}
            className="p-0! text-ink! hover:bg-transparent! hover:underline!"
          />
          {/* Stub — no Kudos detail page in this build's scope. The trailing
              arrow matches the design's "Xem chi tiết ↗" affordance. */}
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 text-base leading-6 font-bold tracking-[0.15px] text-ink hover:underline"
          >
            {viewDetailLabel}
            <ArrowUpRightIcon className="h-5 w-5 shrink-0" />
          </button>
        </div>
      </div>
    </article>
  );
}
