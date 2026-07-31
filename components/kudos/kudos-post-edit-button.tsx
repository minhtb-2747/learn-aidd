"use client";

import { PenIcon } from "@/icons";
import type { KudosPost } from "@/lib/kudos/types";
import { useKudosModals } from "./kudos-modals-provider";

export interface KudosPostEditButtonProps {
  post: KudosPost;
  ariaLabel: string;
}

/**
 * Edit-pencil trigger for a feed post (C.3.6 → edit dialog, MoMorph node
 * `1949:13746`). Kept as its own small client component so `KudosPostCard`
 * can stay a server component; clicking seeds the shared Write-Kudos dialog
 * (in "edit" mode) from this post via `useKudosModals().openEdit`.
 */
export default function KudosPostEditButton({
  post,
  ariaLabel,
}: KudosPostEditButtonProps) {
  const { openEdit } = useKudosModals();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() =>
        openEdit({
          recipientId: post.receiver.profileId ?? undefined,
          recipient: post.receiver.name,
          honorTitle: post.title,
          hashtags: post.hashtags,
          content: post.content,
          anonymous: false,
          nickname: "",
        })
      }
      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-ink transition-colors hover:bg-gold/10"
    >
      <PenIcon className="h-5 w-5" />
    </button>
  );
}
