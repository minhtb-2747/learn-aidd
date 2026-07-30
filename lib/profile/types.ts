import type { KudosPost } from "@/lib/kudos/types";

/**
 * `ProfilePerson`/`ProfileStats` are structurally identical to
 * `KudosPerson`/`KudosStats` (DRY — one definition, re-exported under the
 * vocabulary the profile components already use), so the profile tree keeps
 * its own naming without a second, drifting definition.
 */
export type { KudosPerson as ProfilePerson, KudosStats as ProfileStats } from "@/lib/kudos/types";

/** One "Bộ sưu tập icon của tôi" slot — locked/gray until the matching Secret Box icon is unlocked. */
export interface CollectionIcon {
  unlocked: boolean;
}

/** One post in the profile "KUDOS" list, wrapping the shared `KudosPost` shape with the profile-only "Spam" tag. */
export interface ProfileKudosPost {
  post: KudosPost;
  isSpam: boolean;
}
