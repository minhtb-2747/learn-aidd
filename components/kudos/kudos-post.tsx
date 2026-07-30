import Image from "next/image";
import { SendIcon } from "@/icons";
import type { KudosPost } from "@/lib/kudos/types";
import KudosPersonInfo from "./kudos-person-info";
import KudosHeartButton from "./kudos-heart-button";
import CopyLinkButton from "./copy-link-button";
import KudosPostEditButton from "./kudos-post-edit-button";

export interface KudosPostCardProps {
  post: KudosPost;
  /** Hearts one like is worth right now (active campaign multiplier, else 1). */
  heartMultiplier: number;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
  editAriaLabel: string;
}

/**
 * "ALL KUDOS" feed card (MoMorph C.3/C.5/C.6/C.7, spec item `C.3`): sender →
 * receiver info, timestamp, 5-line-clamped content, up-to-5 image gallery,
 * hashtags, like + copy-link. No "Xem chi tiết" button here — spec C.4 only
 * lists Hearts + Copy Link for the feed action bar.
 */
export default function KudosPostCard({
  post,
  heartMultiplier,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
  editAriaLabel,
}: KudosPostCardProps) {
  return (
    <article className="flex w-full flex-col gap-4 rounded-3xl bg-[#FFF8E1] px-10 pt-10 pb-4">
      <div className="flex items-start justify-between gap-6">
        <KudosPersonInfo person={post.sender} />
        <SendIcon className="mt-8 h-8 w-8 shrink-0 text-ink/70" />
        <KudosPersonInfo person={post.receiver} />
      </div>

      <div className="h-px w-full bg-gold" aria-hidden="true" />

      <div className="flex flex-col gap-3">
        <span className="text-lg leading-7 font-bold tracking-[0.5px] text-black/50">
          {post.time}
        </span>

        {/* Honor title: centred plain text (no bordered pill, per the design),
            with the edit affordance pinned to the right edge. */}
        <div className="flex items-center gap-3">
          <p className="flex-1 text-center text-lg leading-7 font-bold tracking-[0.5px] text-ink">
            {post.title}
          </p>
          <KudosPostEditButton post={post} ariaLabel={editAriaLabel} />
        </div>

        {/* Wrapper is deliberate: see the note in `kudos-card.tsx` — a clamped
            <p> used directly as a flex item loses its ellipsis. */}
        <div className="rounded-2xl bg-[#FFEA9E66] px-6 py-6">
          <p className="line-clamp-5 text-lg leading-8 font-bold tracking-[0.5px] text-ink">
            {post.content}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {post.images.slice(0, 5).map((src, index) => (
            <div
              key={`${post.id}-image-${index}`}
              className="relative h-22 w-22 shrink-0 overflow-hidden rounded-lg border border-gold-line/60 bg-white"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="88px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Hashtags render in the accent red from the design, not muted grey. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {post.hashtags.map((tag) => (
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

      <div className="flex items-center gap-6 justify-between">
        <KudosHeartButton
          kudoId={post.id}
          initialLikes={post.likes}
          initialLiked={post.likedByCurrentUser}
          heartMultiplier={heartMultiplier}
          likeAriaLabel={likeAriaLabel}
          unlikeAriaLabel={unlikeAriaLabel}
        />
        <CopyLinkButton
          label={copyLinkLabel}
          toastMessage={toastMessage}
          className="p-0! text-ink! hover:bg-transparent! hover:underline!"
        />
      </div>
    </article>
  );
}
