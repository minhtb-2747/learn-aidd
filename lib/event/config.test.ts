import { afterEach, describe, expect, it, vi } from "vitest";
import { getEventDateTime } from "./config";

afterEach(() => vi.unstubAllEnvs());

/**
 * A misconfigured env must degrade to "event passed", never crash the page —
 * `proxy.ts` calls this on every request to decide the prelaunch gate, so a
 * throw here would take down the whole site.
 */
describe("getEventDateTime", () => {
  it("parses a valid ISO string", () => {
    vi.stubEnv("EVENT_DATETIME", "2026-08-15T10:00:00.000Z");
    expect(getEventDateTime()?.toISOString()).toBe("2026-08-15T10:00:00.000Z");
  });

  it("respects an explicit offset rather than assuming UTC", () => {
    vi.stubEnv("EVENT_DATETIME", "2026-08-15T17:00:00+07:00");
    expect(getEventDateTime()?.toISOString()).toBe("2026-08-15T10:00:00.000Z");
  });

  it.each([
    ["unset", undefined],
    ["empty", ""],
  ])("returns null when %s", (_label, value) => {
    vi.stubEnv("EVENT_DATETIME", value);
    expect(getEventDateTime()).toBeNull();
  });

  it.each(["not-a-date", "2026-13-45", "tomorrow", "{}"])(
    "returns null instead of throwing on %s",
    (raw) => {
      vi.stubEnv("EVENT_DATETIME", raw);
      expect(() => getEventDateTime()).not.toThrow();
      expect(getEventDateTime()).toBeNull();
    },
  );
});
