import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useScrolled } from "./use-scrolled";

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true, writable: true });
}

afterEach(() => scrollTo(0));

describe("useScrolled", () => {
  it("starts false so SSR and the first client render agree", () => {
    scrollTo(0);
    expect(renderHook(() => useScrolled()).result.current).toBe(false);
  });

  it("corrects itself on mount when the page is ALREADY scrolled", () => {
    // A reload restores the scroll offset without firing any scroll event. This
    // is the whole reason the effect calls update() once before subscribing —
    // without it the header would stay translucent until the user scrolled again.
    scrollTo(900);
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(true);
  });

  it("flips to true once the page scrolls past the threshold", () => {
    scrollTo(0);
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(false);

    act(() => {
      scrollTo(1);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);
  });

  it("flips back at the top", () => {
    scrollTo(500);
    const { result } = renderHook(() => useScrolled());

    act(() => {
      scrollTo(0);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);
  });

  it("honours a custom threshold", () => {
    scrollTo(50);
    const { result } = renderHook(() => useScrolled(100));
    expect(result.current).toBe(false);

    act(() => {
      scrollTo(101);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);
  });

  it("subscribes passively so it can never block scrolling", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useScrolled());

    const call = addSpy.mock.calls.find(([type]) => type === "scroll");
    expect(call?.[2]).toEqual({ passive: true });
    addSpy.mockRestore();
  });

  it("removes its listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    renderHook(() => useScrolled()).unmount();

    expect(removeSpy.mock.calls.some(([type]) => type === "scroll")).toBe(true);
    removeSpy.mockRestore();
  });
});
