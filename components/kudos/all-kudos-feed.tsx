import { allKudosPosts } from "@/lib/kudos/mock-data";
import KudosPostCard from "./kudos-post";

export interface AllKudosFeedProps {
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
}

/**
 * Left column of the "ALL KUDOS" section (MoMorph C.2, spec item `C.2`): the
 * vertical list of Kudos post cards. The design's infinite scroll (spec:
 * "Pagination / scroll: infinity scroll") is out of scope here — the full
 * mock list renders directly, no fetch-more engine.
 */
export default function AllKudosFeed({
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
}: AllKudosFeedProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {allKudosPosts.map((post) => (
        <KudosPostCard
          key={post.id}
          post={post}
          likeAriaLabel={likeAriaLabel}
          unlikeAriaLabel={unlikeAriaLabel}
          copyLinkLabel={copyLinkLabel}
          toastMessage={toastMessage}
        />
      ))}
    </div>
  );
}
