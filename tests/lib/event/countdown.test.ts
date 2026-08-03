import { describe, expect, it } from "vitest";
import { computeCountdown, pad2 } from "@/lib/event/countdown";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

describe("computeCountdown", () => {
  const now = new Date("2026-08-01T00:00:00.000Z");

  it("treats a null target as passed rather than throwing", () => {
    expect(computeCountdown(null, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      isBeforeEvent: false,
    });
  });

  it("treats an exactly-now target as passed, not as 0 remaining", () => {
    expect(computeCountdown(now, now).isBeforeEvent).toBe(false);
  });

  it("treats a past target as passed", () => {
    expect(computeCountdown(new Date(now.getTime() - 1), now).isBeforeEvent).toBe(false);
  });

  it("breaks the remainder into whole days / hours / minutes", () => {
    const target = new Date(now.getTime() + 2 * DAY + 3 * HOUR + 4 * 60_000);
    expect(computeCountdown(target, now)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      isBeforeEvent: true,
    });
  });

  it("floors rather than rounds — 59s away is still 0 minutes", () => {
    expect(computeCountdown(new Date(now.getTime() + 59_000), now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      isBeforeEvent: true,
    });
  });

  it("keeps hours under 24 and minutes under 60", () => {
    const target = new Date(now.getTime() + 10 * DAY + 23 * HOUR + 59 * 60_000);
    const result = computeCountdown(target, now);
    expect(result.hours).toBeLessThan(24);
    expect(result.minutes).toBeLessThan(60);
    expect(result).toMatchObject({ days: 10, hours: 23, minutes: 59 });
  });

  it("works off absolute epoch difference, so the ISO offset is respected", () => {
    // Same instant written two ways must produce the same countdown.
    const asUtc = computeCountdown(new Date("2026-08-02T00:00:00.000Z"), now);
    const asOffset = computeCountdown(new Date("2026-08-02T07:00:00.000+07:00"), now);
    expect(asOffset).toEqual(asUtc);
    expect(asUtc.days).toBe(1);
  });
});

describe("pad2", () => {
  it.each([
    [0, "00"],
    [5, "05"],
    [59, "59"],
    [100, "100"],
  ])("formats %i as %s", (input, expected) => {
    expect(pad2(input)).toBe(expected);
  });
});
