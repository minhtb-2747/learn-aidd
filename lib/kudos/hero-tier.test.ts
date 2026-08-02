import { describe, expect, it } from "vitest";
import { HERO_TIERS } from "./rules-content";
import { heroTierForSenderCount, starsForBadge } from "./hero-tier";

const [NEW, RISING, SUPER, LEGEND] = HERO_TIERS.map((tier) => tier.badgeLabel);

describe("heroTierForSenderCount", () => {
  it("returns no tier below one sender", () => {
    expect(heroTierForSenderCount(0)).toBeNull();
    expect(heroTierForSenderCount(-3)).toBeNull();
  });

  // Boundaries are the whole point — 1-4 / 5-9 / 10-20 / >20 per the Rules panel.
  it.each([
    [1, NEW],
    [4, NEW],
    [5, RISING],
    [9, RISING],
    [10, SUPER],
    [20, SUPER],
    [21, LEGEND],
    [1000, LEGEND],
  ])("maps %i distinct senders to %s", (count, expected) => {
    expect(heroTierForSenderCount(count)).toBe(expected);
  });

  it("derives its labels from HERO_TIERS so the rule and the panel cannot drift", () => {
    // If someone renames a tier in rules-content.ts, this fails rather than
    // letting the badge silently disagree with the copy users read.
    expect(HERO_TIERS.map((t) => t.badgeLabel)).toEqual([
      "New Hero",
      "Rising Hero",
      "Super Hero",
      "Legend Hero",
    ]);
    expect(heroTierForSenderCount(1)).toBe(HERO_TIERS[0].badgeLabel);
    expect(heroTierForSenderCount(21)).toBe(HERO_TIERS[3].badgeLabel);
  });
});

describe("starsForBadge", () => {
  it.each([
    [NEW, 1],
    [RISING, 2],
    [SUPER, 3],
    [LEGEND, 3],
  ])("gives %s %i star(s)", (badge, stars) => {
    expect(starsForBadge(badge)).toBe(stars);
  });

  it("returns 0 — not 1 — for an unknown or empty label", () => {
    // A zero-kudos profile has an empty badge; it must render no phantom star.
    expect(starsForBadge("")).toBe(0);
    expect(starsForBadge("Nonexistent Hero")).toBe(0);
  });
});
