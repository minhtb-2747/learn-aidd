import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithIntl, screen, waitFor } from "@/tests/test-utils";
import { toggleKudoLike } from "@/app/actions/kudos-likes";
import KudosHeartButton from "@/components/kudos/kudos-heart-button";

vi.mock("@/app/actions/kudos-likes", () => ({ toggleKudoLike: vi.fn() }));
const mockToggle = vi.mocked(toggleKudoLike);

function setup(props: Partial<Parameters<typeof KudosHeartButton>[0]> = {}) {
  renderWithIntl(
    <KudosHeartButton
      kudoId="7"
      initialLikes={10}
      initialLiked={false}
      heartMultiplier={1}
      likeAriaLabel="Thích"
      unlikeAriaLabel="Bỏ thích"
      {...props}
    />,
  );
  return { button: screen.getByRole("button") };
}

beforeEach(() => mockToggle.mockReset());

describe("KudosHeartButton", () => {
  it("renders the initial count and pressed state", () => {
    const { button } = setup({ initialLikes: 42, initialLiked: true });
    expect(button).toHaveTextContent("42");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("aria-label", "Bỏ thích");
  });

  it("adds one heart optimistically with no campaign running", async () => {
    // The server value is deliberately different, so the assertion below can
    // only be satisfied by the OPTIMISTIC update, not by the reply.
    mockToggle.mockResolvedValue({ ok: true, liked: true, heartValue: 9 });
    const { button } = setup({ heartMultiplier: 1 });

    fireEvent.click(button);
    expect(button).toHaveTextContent("11");
    expect(button).toHaveAttribute("aria-pressed", "true");

    await waitFor(() => expect(button).toHaveTextContent("19"));
  });

  it("adds the MULTIPLIER, not a flat 1, during an x2 campaign", async () => {
    // A flat ±1 made the counter jump twice: +1 on click, then +2 on the reply.
    mockToggle.mockResolvedValue({ ok: true, liked: true, heartValue: 9 });
    const { button } = setup({ heartMultiplier: 2 });

    fireEvent.click(button);
    expect(button).toHaveTextContent("12");

    await waitFor(() => expect(button).toHaveTextContent("19"));
  });

  it("never applies a delta below 1, even if the multiplier is nonsense", async () => {
    mockToggle.mockResolvedValue({ ok: true, liked: true, heartValue: 9 });
    const { button } = setup({ heartMultiplier: 0 });

    fireEvent.click(button);
    expect(button).toHaveTextContent("11");

    await waitFor(() => expect(button).toHaveTextContent("19"));
  });

  it("lets the server's heartValue win on reconcile", async () => {
    // The campaign can start or end between render and click, so the server
    // number is authoritative even when it disagrees with the optimistic one.
    mockToggle.mockResolvedValue({ ok: true, liked: true, heartValue: 3 });
    const { button } = setup({ initialLikes: 10, heartMultiplier: 2 });

    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent("13"));
  });

  it("subtracts on unlike using the server's value", async () => {
    mockToggle.mockResolvedValue({ ok: true, liked: false, heartValue: 2 });
    const { button } = setup({ initialLikes: 10, initialLiked: true, heartMultiplier: 2 });

    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent("8"));
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("rolls back to the pre-click state when the action fails", async () => {
    mockToggle.mockResolvedValue({ ok: false, error: "Không thể" });
    const { button } = setup({ initialLikes: 10, initialLiked: false });

    fireEvent.click(button);
    expect(button).toHaveTextContent("11");

    await waitFor(() => expect(button).toHaveTextContent("10"));
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("passes the kudos id through to the action", async () => {
    mockToggle.mockResolvedValue({ ok: true, liked: true, heartValue: 1 });
    const { button } = setup({ kudoId: "12345" });

    fireEvent.click(button);
    await waitFor(() => expect(mockToggle).toHaveBeenCalledWith("12345"));
  });
});
