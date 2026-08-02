import { describe, expect, it } from "vitest";
import { renderWithIntl, screen } from "@/test-utils";
import RouteLoadingOverlay from "./route-loading-overlay";

describe("RouteLoadingOverlay", () => {
  it("renders nothing at rest", () => {
    const { container } = renderWithIntl(<RouteLoadingOverlay active={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the translated label while a filter is in flight", () => {
    renderWithIntl(<RouteLoadingOverlay active />);
    // Resolved through the real vi.json, so a renamed key fails here.
    expect(screen.getByText("Đang tải…")).toBeInTheDocument();
  });

  it("announces itself as a busy status region", () => {
    renderWithIntl(<RouteLoadingOverlay active />);
    const status = screen.getByRole("status");

    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("covers the viewport above the header and the modals", () => {
    renderWithIntl(<RouteLoadingOverlay active />);
    const status = screen.getByRole("status");

    // The header sits at z-40 and the modals at z-50; anything lower here would
    // leave part of the page clickable.
    expect(status.className).toContain("fixed");
    expect(status.className).toContain("inset-0");
    expect(status.className).toContain("z-60");
  });

  it("holds opacity at 0 until the delay elapses, so a fast filter never flashes", () => {
    renderWithIntl(<RouteLoadingOverlay active />);
    const status = screen.getByRole("status");

    // `both` is what keeps it invisible during the delay while still mounted
    // and already swallowing clicks.
    expect(status.className).toContain("animate-[overlay-fade_150ms_ease-out_180ms_both]");
  });
});
