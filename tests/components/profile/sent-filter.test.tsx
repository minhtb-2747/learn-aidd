import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SentFilter, { type SentFilterOption } from "@/components/profile/sent-filter";

const OPTIONS: [SentFilterOption, SentFilterOption] = [
  { value: "sent", label: "Đã gửi", count: 5 },
  { value: "received", label: "Đã nhận", count: 12 },
];

function setup(props: Partial<Parameters<typeof SentFilter>[0]> = {}) {
  const onChange = vi.fn();
  render(<SentFilter options={OPTIONS} value="sent" onChange={onChange} {...props} />);
  return { onChange };
}

describe("SentFilter", () => {
  it("shows the active option with its count", () => {
    setup();
    expect(screen.getByRole("button", { name: "Đã gửi (5)" })).toBeInTheDocument();
  });

  it("lists both options once opened", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Đã gửi (5)" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Đã nhận (12)" })).toBeInTheDocument();
  });

  it("reports the chosen value and closes", () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Đã gửi (5)" }));
    fireEvent.click(screen.getByRole("button", { name: "Đã nhận (12)" }));

    expect(onChange).toHaveBeenCalledWith("received");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks the active option as selected for assistive tech", () => {
    setup({ value: "received" });
    fireEvent.click(screen.getByRole("button", { name: "Đã nhận (12)" }));

    expect(screen.getByRole("option", { name: "Đã nhận (12)" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  describe("while a filter navigation is in flight", () => {
    it("disables the trigger and refuses to open", () => {
      const { onChange } = setup({ disabled: true });
      const trigger = screen.getByRole("button", { name: "Đã gửi (5)" });

      expect(trigger).toBeDisabled();
      fireEvent.click(trigger);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("closes a list that was already open", () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SentFilter options={OPTIONS} value="sent" onChange={onChange} />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Đã gửi (5)" }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      rerender(<SentFilter options={OPTIONS} value="sent" onChange={onChange} disabled />);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});
