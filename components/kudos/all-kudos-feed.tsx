import type { KudosPost } from "@/lib/kudos/types";
import KudosPostCard from "./kudos-post";

export interface AllKudosFeedProps {
  posts: KudosPost[];
  /** Hearts one like is worth right now (active campaign multiplier, else 1). */
  heartMultiplier: number;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
  editAriaLabel: string;
}

/**
 * Left column of the "ALL KUDOS" section (MoMorph C.2, spec item `C.2`): the
 * vertical list of Kudos post cards, newest-first (see `getAllKudosPosts`).
 * The design's infinite scroll (spec: "Pagination / scroll: infinity
 * scroll") is out of scope here — the first page renders directly, no
 * fetch-more engine. An empty `posts` array simply renders no cards, so
 * there is nothing to guard against here.
 */
export default function AllKudosFeed({
  posts,
  heartMultiplier,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
  editAriaLabel,
}: AllKudosFeedProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {posts.map((post) => (
        <KudosPostCard
          key={post.id}
          post={post}
          heartMultiplier={heartMultiplier}
          likeAriaLabel={likeAriaLabel}
          unlikeAriaLabel={unlikeAriaLabel}
          copyLinkLabel={copyLinkLabel}
          toastMessage={toastMessage}
          editAriaLabel={editAriaLabel}
        />
      ))}
    </div>
  );
}
