"use client";

import { useState } from "react";
import ProfileKudosCard from "@/components/profile/profile-kudos-card";
import SentFilter, {
  type SentFilterValue,
} from "@/components/profile/sent-filter";
import type { ProfileKudosPost } from "@/lib/profile/mock-data";

export interface ProfileKudosListProps {
  posts: ProfileKudosPost[];
  sentCount: number;
  receivedCount: number;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
}

/**
 * "Sun* Annual Awards 2025 / KUDOS" section (MoMorph spec `C`/`D`): section
 * header with the "Đã gửi (N)" filter dropdown, followed by the post list.
 * The mock dataset has no separate "received" post set, so switching the
 * filter only swaps the dropdown's label/count (per the profile-page build
 * scope) — the card list itself stays the same.
 */
export default function ProfileKudosList({
  posts,
  sentCount,
  receivedCount,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
}: ProfileKudosListProps) {
  const [filter, setFilter] = useState<SentFilterValue>("sent");

  return (
    <section className="mx-auto flex w-full max-w-170 flex-col gap-10 px-6 pt-14 pb-20">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl leading-8 font-bold text-white">
          Sun* Annual Awards 2025
        </h2>
        <div className="h-px w-full bg-divider" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-4xl leading-16 font-bold tracking-[-0.25px] text-gold">
            KUDOS
          </h3>
          <SentFilter
            value={filter}
            onChange={setFilter}
            options={[
              { value: "sent", label: "Đã gửi", count: sentCount },
              { value: "received", label: "Đã nhận", count: receivedCount },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {posts.map(({ post, isSpam }) => (
          <ProfileKudosCard
            key={post.id}
            post={post}
            isSpam={isSpam}
            likeAriaLabel={likeAriaLabel}
            unlikeAriaLabel={unlikeAriaLabel}
            copyLinkLabel={copyLinkLabel}
            toastMessage={toastMessage}
          />
        ))}
      </div>
    </section>
  );
}
