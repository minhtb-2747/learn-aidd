import { createClient } from "@/lib/supabase/server";
import type { CollectionIcon } from "@/lib/profile/types";

/**
 * Engagement + Secret Box counters for a profile. Both functions read
 * `secret_boxes` under the RLS rules that make OPENED boxes public and
 * UNOPENED boxes owner-only. (`./queries.ts` owns identity and kudos lists.)
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
 * Engagement counters for ANY profile id — the id-scoped counterpart to
 * `getCurrentUserStats()`, which only ever describes the session user.
 *
 * How RLS shapes each number when viewing someone else's profile:
 *  - `heartsReceived` — accurate for any viewer. Summing `like_count` is the
 *    only correct source: the trigger already folded campaign multipliers in.
 *  - `boxesOpened` — accurate for any viewer (`secret_boxes_select_opened`).
 *  - `boxesUnopened` — intentionally 0 for anyone but the owner; an unopened box
 *    stays a surprise. RLS filters the rows out, so no branching is needed here.
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
 * 6 icon-collection slots, unlocked from this profile's opened Secret Box count.
 * `secret_boxes_select_opened` makes opened boxes readable regardless of viewer,
 * so this is real data for any profile id, not just the session's own.
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
