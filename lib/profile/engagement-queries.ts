import { createClient } from "@/lib/supabase/server";
import type { CollectionIcon } from "@/lib/profile/types";

/**
 * Engagement + Secret Box reward counters for a profile.
 *
 * Split out of `./queries.ts` (which owns identity and the kudos lists) to
 * keep both files inside the 200-line cap and because these two functions
 * share one concern: reading `secret_boxes` under the RLS rules that make
 * OPENED boxes public and UNOPENED boxes owner-only.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ICON_SLOTS = 6;

/** Guards non-UUID `[id]` route params so a junk value can never reach Postgres. */
function isValidUuid(id: string): boolean {
  return UUID_PATTERN.test(id);
}

/** The three engagement counters that `getPeopleMeta` does not already supply. */
export interface ProfileEngagementStats {
  heartsReceived: number;
  boxesOpened: number;
  boxesUnopened: number;
}

const ZERO_ENGAGEMENT: ProfileEngagementStats = {
  heartsReceived: 0,
  boxesOpened: 0,
  boxesUnopened: 0,
};

/**
 * Per-profile engagement counters, for ANY profile id — the id-scoped
 * counterpart to `getCurrentUserStats()` (which resolves `auth.uid()` and so
 * only ever describes the session user).
 *
 * How RLS shapes each number, viewed from someone else's profile:
 *  - `heartsReceived` — sums `like_count` over that profile's PUBLISHED kudos.
 *    `kudos_select` exposes published rows to everyone, so this is accurate
 *    for any viewer. Summing `like_count` is the only correct source because
 *    the trigger has already folded campaign heart multipliers into it.
 *  - `boxesOpened` — accurate for any viewer, via the `secret_boxes_select_opened`
 *    policy (the same one the board's gift leaderboard depends on).
 *  - `boxesUnopened` — intentionally 0 for anyone but the owner. `secret_boxes_select`
 *    is owner-scoped and no policy exposes UNOPENED boxes, because an unopened
 *    box is meant to stay a surprise. This is a privacy decision expressed in
 *    the schema, not a gap to work around: RLS simply filters those rows out,
 *    so the count arrives as 0 without any branching here.
 */
export async function getProfileEngagementStats(
  id: string,
): Promise<ProfileEngagementStats> {
  if (!isValidUuid(id)) return ZERO_ENGAGEMENT;

  const supabase = await createClient();
  const [heartsRows, boxesOpened, boxesUnopened] = await Promise.all([
    supabase
      .from("kudos")
      .select("like_count")
      .eq("receiver_id", id)
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("secret_boxes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("is_opened", true),
    supabase
      .from("secret_boxes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("is_opened", false),
  ]);
  for (const result of [heartsRows, boxesOpened, boxesUnopened]) {
    if (result.error) throw result.error;
  }

  const heartsReceived = ((heartsRows.data ?? []) as { like_count: number }[]).reduce(
    (sum, row) => sum + row.like_count,
    0,
  );

  return {
    heartsReceived,
    boxesOpened: boxesOpened.count ?? 0,
    boxesUnopened: boxesUnopened.count ?? 0,
  };
}

/**
 * 6 icon-collection slots, unlocked from this profile's opened Secret Box
 * count. `secret_boxes_select_opened` (phase 01) makes opened boxes readable
 * regardless of viewer, so — unlike the spec's fallback note — this reflects
 * real data for any profile id, not just the current session's own.
 */
export async function getCollectionIcons(id: string): Promise<CollectionIcon[]> {
  if (!isValidUuid(id)) {
    return Array.from({ length: ICON_SLOTS }, () => ({ unlocked: false }));
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("secret_boxes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("is_opened", true);
  if (error) throw error;

  const unlockedCount = Math.min(count ?? 0, ICON_SLOTS);
  return Array.from({ length: ICON_SLOTS }, (_, index) => ({ unlocked: index < unlockedCount }));
}
