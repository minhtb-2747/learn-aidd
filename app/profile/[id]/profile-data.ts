import {
  getProfileById,
  getProfileCounts,
  getProfileKudos,
} from "@/lib/profile/queries";
import {
  getCollectionIcons,
  getProfileEngagementStats,
} from "@/lib/profile/engagement-queries";
import { getActiveCampaign, type ActiveCampaign } from "@/lib/kudos/queries/engagement";
import type { CollectionIcon, ProfileKudosPost, ProfilePerson, ProfileStats } from "@/lib/profile/types";

export interface ProfileData {
  person: ProfilePerson;
  stats: ProfileStats;
  icons: CollectionIcon[];
  posts: ProfileKudosPost[];
  counts: { sent: number; received: number };
  campaign: ActiveCampaign | null;
}

/**
 * Assembles the `/profile/[id]` view-model. `null` means the id is malformed
 * or the profile doesn't exist — the page turns that into `notFound()`.
 *
 * `ProfileStats.kudosReceived`/`kudosSent` come from `person` (the same
 * hero-tier-meta numbers shown everywhere else a `KudosPerson` appears), while
 * `counts.sent`/`counts.received` (from `getProfileCounts`) drive the
 * Đã gửi/Đã nhận dropdown + post list, whose semantics differ (sent includes
 * the owner's own non-published/spam rows; received is published-only) — see
 * `lib/profile/queries.ts`'s own docs.
 *
 * `heartsReceived`/`boxesOpened`/`boxesUnopened` come from the id-scoped
 * `getProfileEngagementStats(id)`, so they are correct on anyone's profile —
 * not just the viewer's own. The one asymmetry is deliberate and enforced by
 * RLS rather than by code here: `boxesUnopened` reads 0 for any viewer who is
 * not the owner, because an unopened Secret Box is meant to stay a surprise.
 * See that function's doc comment for the per-counter reasoning.
 */
export async function getProfileData(
  id: string,
  filter: "sent" | "received",
): Promise<ProfileData | null> {
  const person = await getProfileById(id);
  if (!person) return null;

  const [posts, counts, icons, campaign, engagement] = await Promise.all([
    getProfileKudos(id, filter),
    getProfileCounts(id),
    getCollectionIcons(id),
    getActiveCampaign(),
    getProfileEngagementStats(id),
  ]);

  const stats: ProfileStats = {
    kudosReceived: person.kudosReceived,
    kudosSent: person.kudosSent,
    ...engagement,
  };

  return { person, stats, icons, posts, counts, campaign };
}
