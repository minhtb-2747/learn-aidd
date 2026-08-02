import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import HighlightFilterDropdown from "./highlight-filter-dropdown";

const OPTIONS = ["teamwork", "delivery", "kaizen"];

function setup(props: Partial<Parameters<typeof HighlightFilterDropdown>[0]> = {}) {
  const onSelect = vi.fn();
  render(
    <HighlightFilterDropdown
      label="Hashtag"
      options={OPTIONS}
      active={null}
      onSelect={onSelect}
      {...props}
    />,
  );
  return { onSelect, trigger: screen.getByRole("button", { name: /hashtag|teamwork/i }) };
}

describe("HighlightFilterDropdown", () => {
  it("shows the label until something is selected, then the selection", () => {
    const { trigger } = setup();
    expect(trigger).toHaveTextContent("Hashtag");

    render(
      <HighlightFilterDropdown
        label="Hashtag"
        options={OPTIONS}
        active="teamwork"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "teamwork" })).toBeInTheDocument();
  });

  it("opens the list on click and closes it after choosing", () => {
    const { onSelect, trigger } = setup();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /teamwork|delivery|kaizen/ })).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "delivery" }));
    expect(onSelect).toHaveBeenCalledWith("delivery");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clears the filter when the already-active option is chosen again", () => {
    const onSelect = vi.fn();
    render(
      <HighlightFilterDropdown
        label="Hashtag"
        options={OPTIONS}
        active="teamwork"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "teamwork" }));
    fireEvent.click(screen.getAllByRole("button", { name: "teamwork" })[1]);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  describe("while a filter navigation is in flight", () => {
    it("disables the trigger, taking it out of the tab order", () => {
      const { trigger } = setup({ disabled: true });
      expect(trigger).toBeDisabled();
    });

    it("cannot be opened", () => {
      const { trigger, onSelect } = setup({ disabled: true });
      fireEvent.click(trigger);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("never leaves an interactive list behind the overlay", () => {
      // Open first, THEN disable — the menu must go, not linger clickable.
      const onSelect = vi.fn();
      const { rerender } = render(
        <HighlightFilterDropdown
          label="Hashtag"
          options={OPTIONS}
          active={null}
          onSelect={onSelect}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Hashtag" }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      rerender(
        <HighlightFilterDropdown
          label="Hashtag"
          options={OPTIONS}
          active={null}
          onSelect={onSelect}
          disabled
        />,
      );
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("reports itself as collapsed to assistive tech", () => {
      const { trigger } = setup({ disabled: true });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });
});
