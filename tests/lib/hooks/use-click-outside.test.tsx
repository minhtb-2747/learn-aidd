import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

function Panel({ onOutside }: { onOutside: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(onOutside);
  return (
    <div>
      <div ref={ref} data-testid="panel">
        <button type="button">inside</button>
      </div>
      <button type="button">outside</button>
    </div>
  );
}

describe("useClickOutside", () => {
  it("fires when a pointer-down lands outside the element", () => {
    const handler = vi.fn();
    render(<Panel onOutside={handler} />);

    fireEvent.mouseDown(screen.getByText("outside"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("stays quiet for a pointer-down inside, including on a descendant", () => {
    const handler = vi.fn();
    render(<Panel onOutside={handler} />);

    fireEvent.mouseDown(screen.getByTestId("panel"));
    fireEvent.mouseDown(screen.getByText("inside"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls the LATEST handler after a re-render, not the one captured first", () => {
    // The hook mirrors the handler into a ref so the document listener
    // subscribes once. If that mirroring broke, a stale closure would run.
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Panel onOutside={first} />);

    rerender(<Panel onOutside={second} />);
    fireEvent.mouseDown(screen.getByText("outside"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("detaches on unmount", () => {
    const handler = vi.fn();
    const { unmount } = render(<Panel onOutside={handler} />);
    unmount();

    fireEvent.mouseDown(document.body);
    expect(handler).not.toHaveBeenCalled();
  });
});
