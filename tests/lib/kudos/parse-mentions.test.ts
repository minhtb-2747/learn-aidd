import { describe, expect, it } from "vitest";
import { extractMentionCandidates } from "@/lib/kudos/parse-mentions";

/**
 * A Vietnamese name spans several words with no delimiter marking where it
 * ends, so this deliberately over-generates prefixes and lets the caller's exact
 * match discard the misses. These tests pin that trade-off in both directions.
 */
describe("extractMentionCandidates", () => {
  it("emits every word-count prefix of a mention", () => {
    expect(extractMentionCandidates("@Trần Bình Minh ơi").sort()).toEqual(
      ["Trần", "Trần Bình", "Trần Bình Minh", "Trần Bình Minh ơi"].sort(),
    );
  });

  it("keeps Vietnamese diacritics intact", () => {
    expect(extractMentionCandidates("@Nguyễn")).toContain("Nguyễn");
  });

  it("caps the prefix length so a whole sentence is not swallowed", () => {
    const candidates = extractMentionCandidates("@a b c d e f g h");
    const longest = candidates.reduce((a, b) => (a.length > b.length ? a : b));
    expect(longest.split(" ")).toHaveLength(4);
  });

  it("finds several mentions in one body", () => {
    const candidates = extractMentionCandidates("cảm ơn @An và @Bình nhé");
    expect(candidates).toContain("An");
    expect(candidates).toContain("Bình");
  });

  it("de-duplicates repeats of the same mention", () => {
    const candidates = extractMentionCandidates("@An @An");
    expect(candidates.filter((c) => c === "An")).toHaveLength(1);
  });

  it("allows digits after the first letter but never leads with one", () => {
    expect(extractMentionCandidates("@user2")).toContain("user2");
    expect(extractMentionCandidates("@2fast")).not.toContain("2fast");
  });

  it.each([
    ["no mention at all", "cảm ơn bạn rất nhiều"],
    ["a bare @", "@"],
    ["an empty body", ""],
    ["@ before punctuation", "@!!!"],
  ])("returns nothing for %s", (_label, input) => {
    expect(extractMentionCandidates(input)).toEqual([]);
  });

  it("stops at punctuation rather than absorbing it", () => {
    const candidates = extractMentionCandidates("@An, cảm ơn");
    expect(candidates).toContain("An");
    expect(candidates.some((c) => c.includes(","))).toBe(false);
  });
});
