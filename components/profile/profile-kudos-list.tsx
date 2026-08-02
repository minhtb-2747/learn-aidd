"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import RouteLoadingOverlay from "@/components/route-loading-overlay";
import ProfileKudosCard from "@/components/profile/profile-kudos-card";
import SentFilter, {
  type SentFilterValue,
} from "@/components/profile/sent-filter";
import type { ProfileKudosPost } from "@/lib/profile/types";

export interface ProfileKudosListProps {
  posts: ProfileKudosPost[];
  /** Active filter, resolved + defaulted server-side in `app/profile/[id]/page.tsx`. */
  filter: SentFilterValue;
  sentCount: number;
  receivedCount: number;
  /** Hearts one like is worth right now (active campaign multiplier, else 1). */
  heartMultiplier: number;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
  editAriaLabel: string;
  spamLabel: string;
  sectionSubtitle: string;
  sectionTitle: string;
  sentLabel: string;
  receivedLabel: string;
  emptyLabel: string;
  /**
   * Own profile gets the Đã gửi/Đã nhận switch; anyone else's is received-only.
   * A privacy boundary, not just layout — `app/profile/[id]/page.tsx` pins
   * `filter` server-side so `?filter=sent` cannot reveal another person's
   * unpublished or spam-flagged drafts.
   */
  isOwnProfile: boolean;
  /** Pre-translated "Đã nhận: N Kudos", shown when `isOwnProfile` is false. */
  receivedCountLabel: string;
}

/**
 * Profile kudos section: header with the "Đã gửi (N)" filter, then the post
 * list. `filter` is URL-driven ("sent" is the omitted default) so switching
 * re-queries server-side and a reload preserves the selection.
 */
export default function ProfileKudosList({
  posts,
  filter,
  sentCount,
  receivedCount,
  heartMultiplier,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
  editAriaLabel,
  spamLabel,
  sectionSubtitle,
  sectionTitle,
  sentLabel,
  receivedLabel,
  emptyLabel,
  isOwnProfile,
  receivedCountLabel,
}: ProfileKudosListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isFiltering, startFiltering] = useTransition();

  function handleFilterChange(value: SentFilterValue) {
    const query = value === "sent" ? "" : `?filter=${value}`;
    // Inside a transition so `isFiltering` stays true for the whole server
    // round trip — `router.replace` returns immediately and reports nothing.
    startFiltering(() => {
      router.replace(`${pathname}${query}`, { scroll: false });
    });
  }

  return (
    <section className="mx-auto flex w-full max-w-170 flex-col gap-10 px-6 pt-14 pb-20">
      <RouteLoadingOverlay active={isFiltering} />
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl leading-8 font-bold text-white">
          {sectionSubtitle}
        </h2>
        <div className="h-px w-full bg-divider" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-4xl leading-16 font-bold tracking-[-0.25px] text-gold">
            {sectionTitle}
          </h3>
          {isOwnProfile ? (
            <SentFilter
              value={filter}
              onChange={handleFilterChange}
              disabled={isFiltering}
              options={[
                { value: "sent", label: sentLabel, count: sentCount },
                { value: "received", label: receivedLabel, count: receivedCount },
              ]}
            />
          ) : (
            <p className="text-xl leading-7 font-bold text-white">
              {receivedCountLabel}
            </p>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-lg font-bold text-white/60">
          {emptyLabel}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map(({ post, isSpam }) => (
            <ProfileKudosCard
              key={post.id}
              post={post}
              isSpam={isSpam}
              heartMultiplier={heartMultiplier}
              likeAriaLabel={likeAriaLabel}
              unlikeAriaLabel={unlikeAriaLabel}
              copyLinkLabel={copyLinkLabel}
              toastMessage={toastMessage}
              editAriaLabel={editAriaLabel}
              spamLabel={spamLabel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
