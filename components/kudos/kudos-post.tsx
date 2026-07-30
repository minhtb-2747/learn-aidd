import Image from "next/image";
import { SendIcon } from "@/icons";
import type { KudosPost } from "@/lib/kudos/mock-data";
import KudosPersonInfo from "./kudos-person-info";
import KudosHeartButton from "./kudos-heart-button";
import CopyLinkButton from "./copy-link-button";
import KudosPostEditButton from "./kudos-post-edit-button";

export interface KudosPostCardProps {
  post: KudosPost;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
}

/**
 * "ALL KUDOS" feed card (MoMorph C.3/C.5/C.6/C.7, spec item `C.3`): sender →
 * receiver info, timestamp, 5-line-clamped content, up-to-5 image gallery,
 * hashtags, like + copy-link. No "Xem chi tiết" button here — spec C.4 only
 * lists Hearts + Copy Link for the feed action bar.
 */
export default function KudosPostCard({
  post,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
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
        <span className="text-base leading-6 font-bold tracking-[0.5px] text-black/50">
          {post.time}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-gold-line px-4 py-2 text-center text-base leading-6 font-bold tracking-[0.5px] text-ink">
            {post.title}
          </div>
          <KudosPostEditButton post={post} />
        </div>

        <p className="line-clamp-5 text-base leading-6 font-bold tracking-[0.5px] text-ink bg-[#FFEA9E66] px-6 py-8">
          {post.content}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {post.images.slice(0, 5).map((src, index) => (
            <div
              key={`${post.id}-image-${index}`}
              className="relative h-22 w-22 shrink-0 overflow-hidden rounded-[18px] border border-gold-line bg-white"
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

        <div className="flex flex-wrap items-center gap-2">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="text-sm leading-5 font-bold tracking-[0.1px] text-ink/70"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-gold" aria-hidden="true" />

      <div className="flex items-center gap-6 justify-between">
        <KudosHeartButton
          initialLikes={post.likes}
          likeAriaLabel={likeAriaLabel}
          unlikeAriaLabel={unlikeAriaLabel}
        />
        <CopyLinkButton
          label={copyLinkLabel}
          toastMessage={toastMessage}
          className="!p-0 !text-ink hover:!bg-transparent hover:!underline"
        />
      </div>
    </article>
  );
}
