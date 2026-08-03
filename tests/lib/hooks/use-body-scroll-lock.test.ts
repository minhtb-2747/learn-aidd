import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBodyScrollLock } from "@/lib/hooks/use-body-scroll-lock";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("useBodyScrollLock", () => {
  it("does nothing while inactive", () => {
    renderHook(() => useBodyScrollLock(false));
    expect(document.body.style.overflow).toBe("");
  });

  it("locks while active and restores on unmount", () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores whatever was there before, not a hardcoded empty string", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useBodyScrollLock(true));

    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("follows the flag without remounting", () => {
    const { rerender } = renderHook(({ on }) => useBodyScrollLock(on), {
      initialProps: { on: false },
    });
    expect(document.body.style.overflow).toBe("");

    rerender({ on: true });
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ on: false });
    expect(document.body.style.overflow).toBe("");
  });

  describe("with two overlapping locks — the Rules panel over the Write dialog", () => {
    it("stays locked while the upper one closes, then releases with the lower", () => {
      // The trap this hook exists for: two independent locks each keeping their
      // own `previousOverflow` leave the page locked forever, because the upper
      // one hands the lower a `previousOverflow` of "hidden".
      const lower = renderHook(() => useBodyScrollLock(true));
      const upper = renderHook(() => useBodyScrollLock(true));
      expect(document.body.style.overflow).toBe("hidden");

      upper.unmount();
      expect(document.body.style.overflow).toBe("hidden");

      lower.unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("releases correctly even when they unmount out of order", () => {
      const first = renderHook(() => useBodyScrollLock(true));
      const second = renderHook(() => useBodyScrollLock(true));

      first.unmount();
      expect(document.body.style.overflow).toBe("hidden");

      second.unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("records the pre-lock value once, from the first lock only", () => {
      document.body.style.overflow = "auto";
      const lower = renderHook(() => useBodyScrollLock(true));
      const upper = renderHook(() => useBodyScrollLock(true));

      upper.unmount();
      lower.unmount();
      expect(document.body.style.overflow).toBe("auto");
    });
  });
});
