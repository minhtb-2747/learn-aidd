import { HERO_TIERS } from "@/lib/kudos/rules-content";

/**
 * Tier derivation, single source of truth.
 *
 * `HERO_TIERS[].rangeLabel` (rules-content.ts) is the user-facing rule and it
 * counts *people*, not kudos — "Có 1-4 người gửi Kudos cho bạn" — so the tier
 * is derived from the count of DISTINCT SENDERS of published kudos a person
 * has received, never from a total kudos count. Labels are pulled from
 * `HERO_TIERS` (not re-typed) so this table and the Rules panel can never
 * drift apart.
 */
const [NEW_HERO, RISING_HERO, SUPER_HERO, LEGEND_HERO] = HERO_TIERS.map(
  (tier) => tier.badgeLabel,
);

/**
 * Maps a distinct-sender count to a Hero tier label, per the range table:
 * 0 → none, 1–4 → New, 5–9 → Rising, 10–20 → Super, >20 → Legend.
 */
export function heroTierForSenderCount(count: number): string | null {
  if (count <= 0) return null;
  if (count <= 4) return NEW_HERO;
  if (count <= 9) return RISING_HERO;
  if (count <= 20) return SUPER_HERO;
  return LEGEND_HERO;
}

const STARS_BY_TIER: Record<string, number> = {
  [NEW_HERO]: 1,
  [RISING_HERO]: 2,
  [SUPER_HERO]: 3,
  [LEGEND_HERO]: 3,
};

/**
 * Star count ("số hoa thị") for a badge label.
 *
 * NOTE: the old mock's docstring ("1 star = 10 Kudos received, 2 = 20, 3 =
 * 50+") was stale and never matched the real Hero-tier rule above — stars
 * are keyed off the tier label, not a separate kudos-count threshold.
 * Unknown/empty labels (including "no tier yet") return `0`, not the mock's
 * `?? 1` fallback, so a zero-kudos profile renders no phantom star.
 */
export function starsForBadge(badge: string): number {
  return STARS_BY_TIER[badge] ?? 0;
}
