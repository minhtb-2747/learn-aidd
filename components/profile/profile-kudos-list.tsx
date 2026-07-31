"use client";

import { usePathname, useRouter } from "next/navigation";
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
   * The viewer's own profile gets the Đã gửi/Đã nhận switch; anyone else's is
   * received-only, so the switch is replaced by a static count. That is a
   * privacy boundary, not just a layout one — see `app/profile/[id]/page.tsx`,
   * which pins `filter` server-side so `?filter=sent` cannot reveal another
   * person's unpublished or spam-flagged drafts.
   */
  isOwnProfile: boolean;
  /** Pre-translated "Đã nhận: N Kudos", shown when `isOwnProfile` is false. */
  receivedCountLabel: string;
}

/**
 * "Sun* Annual Awards 2025 / KUDOS" section (MoMorph spec `C`/`D`): section
 * header with the "Đã gửi (N)" filter dropdown, followed by the post list.
 * `filter` is URL-driven (`?filter=received`, "sent" is the default/omitted
 * case) so switching it re-queries sent vs. received kudos server-side and a
 * reload preserves the selection — mirrors the Kudos board's hashtag/
 * department filters (`components/kudos/highlight-carousel.tsx`).
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

  function handleFilterChange(value: SentFilterValue) {
    const query = value === "sent" ? "" : `?filter=${value}`;
    router.replace(`${pathname}${query}`, { scroll: false });
  }

  return (
    <section className="mx-auto flex w-full max-w-170 flex-col gap-10 px-6 pt-14 pb-20">
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
