import { SendIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";
import type { HighlightKudos } from "@/lib/kudos/mock-data";
import KudosPersonInfo from "./kudos-person-info";
import KudosHeartButton from "./kudos-heart-button";
import CopyLinkButton from "./copy-link-button";

export interface KudosCardProps {
  kudos: HighlightKudos;
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

      <div className="flex flex-col items-end gap-4">
        <span className="w-full text-left text-base leading-6 font-bold tracking-[0.5px] text-black/50">
          {kudos.time}
        </span>
        <span className="rounded bg-ink px-3 py-1 text-base leading-6 font-bold tracking-[0.5px] text-white">
          {kudos.title}
        </span>
        <p className="line-clamp-3 w-full text-left text-base leading-6 font-bold tracking-[0.5px] text-ink">
          {kudos.content}
        </p>
        <div className="flex w-full flex-wrap items-center gap-2">
          {kudos.hashtags.map((tag) => (
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

      <div className="flex items-center justify-between gap-6">
        <KudosHeartButton
          initialLikes={kudos.likes}
          likeAriaLabel={likeAriaLabel}
          unlikeAriaLabel={unlikeAriaLabel}
        />
        <div className="flex items-center gap-2">
          <CopyLinkButton
            label={copyLinkLabel}
            toastMessage={toastMessage}
            className="!p-0 !text-ink hover:!bg-transparent hover:!underline"
          />
          {/* Stub — no Kudos detail page in this build's scope. */}
          <button
            type="button"
            className="p-4 text-base leading-6 font-bold tracking-[0.15px] text-ink hover:underline"
          >
            {viewDetailLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
