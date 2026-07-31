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
 * Assembles the `/profile/[id]` view-model; `null` means malformed id or no
 * such profile, which the page turns into `notFound()`.
 *
 * `stats.kudosReceived`/`kudosSent` and `counts.sent`/`received` deliberately
 * differ: the former are the hero-tier numbers shown wherever a `KudosPerson`
 * appears, the latter drive the post list and count the owner's own
 * non-published/spam rows too.
 *
 * Engagement counters are id-scoped, so they are right on anyone's profile.
 * `boxesUnopened` reading 0 for non-owners is RLS doing its job, not a bug.
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
