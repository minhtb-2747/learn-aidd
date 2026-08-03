import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * This is the open-redirect gate for the post-login `?next=`. Every case below
 * is an attack shape, not a style preference — a regression here sends a signed-in
 * user to an attacker's origin carrying their session.
 */
describe("safeNext", () => {
  it("keeps a same-origin path", () => {
    expect(safeNext("/kudos")).toBe("/kudos");
    expect(safeNext("/profile/abc?tab=1#top")).toBe("/profile/abc?tab=1#top");
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["empty", ""],
  ])("falls back to root when %s", (_label, input) => {
    expect(safeNext(input)).toBe("/");
  });

  it.each([
    "//evil.com",
    "///evil.com",
    "//evil.com/path",
  ])("rejects the protocol-relative %s", (input) => {
    expect(safeNext(input)).toBe("/");
  });

  it.each([
    "/\\evil.com",
    "/\\\\evil.com",
  ])("rejects the backslash-smuggled %s", (input) => {
    // Some browsers normalise `\` to `/`, turning this into `//evil.com`.
    expect(safeNext(input)).toBe("/");
  });

  it.each([
    "https://evil.com",
    "http://evil.com",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "evil.com",
  ])("rejects %s — anything not starting with a single slash", (input) => {
    expect(safeNext(input)).toBe("/");
  });
});
