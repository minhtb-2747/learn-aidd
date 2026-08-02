import { HERO_TIERS } from "@/lib/kudos/rules-content";

/**
 * The user-facing rule counts PEOPLE, not kudos, so tiers derive from the count
 * of DISTINCT SENDERS — never from a total kudos count. Labels are pulled from
 * `HERO_TIERS` rather than re-typed, so the two can never drift apart.
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
 * Star count for a badge label — keyed off the TIER, not a separate kudos
 * threshold. Unknown/empty labels return 0 so a zero-kudos profile renders no
 * phantom star.
 */
export function starsForBadge(badge: string): number {
  return STARS_BY_TIER[badge] ?? 0;
}
