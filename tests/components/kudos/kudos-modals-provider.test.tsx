import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithIntl, screen } from "@/tests/test-utils";
import KudosModalsProvider, { useKudosModals } from "@/components/kudos/kudos-modals-provider";

// The compose form reaches for server actions on mount; none of them matter to
// the layering behaviour under test.
vi.mock("@/app/actions/kudos", () => ({
  searchSunnersAction: vi.fn().mockResolvedValue([]),
  createKudos: vi.fn(),
}));
vi.mock("@/app/actions/kudos-images", () => ({
  uploadKudoImage: vi.fn(),
  removeKudoImage: vi.fn(),
}));

function Opener() {
  const { openWrite } = useKudosModals();
  return (
    <button type="button" onClick={() => openWrite()}>
      mở form
    </button>
  );
}

function setup() {
  renderWithIntl(
    <KudosModalsProvider>
      <Opener />
    </KudosModalsProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "mở form" }));
}

const editor = () => document.querySelector('[contenteditable="true"]');
const rulesPanel = () => screen.queryByRole("heading", { name: "Thể lệ" });

// The panel has two "Đóng" buttons: the full-bleed overlay, whose accessible
// name is "Đóng bảng thể lệ", and the footer button. This is the footer one.
const closePanel = () =>
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }));

function typeDraft(text: string) {
  const el = editor();
  if (!el) throw new Error("form not open");
  el.textContent = text;
  fireEvent.input(el);
}

/**
 * Regression: clicking "Tiêu chuẩn cộng đồng" inside the compose form used to
 * close the dialog, which returns `null` and unmounts the form — so the draft
 * was destroyed, not merely hidden. The panel must layer over the dialog now.
 */
describe("KudosModalsProvider — Rules panel over the Write dialog", () => {
  it("opens the compose form", () => {
    setup();
    expect(editor()).toBeTruthy();
    expect(rulesPanel()).not.toBeInTheDocument();
  });

  it("KEEPS the form mounted when the rules link is clicked", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));

    expect(rulesPanel()).toBeInTheDocument();
    expect(editor()).toBeTruthy();
  });

  it("preserves the draft across opening and closing the panel", () => {
    setup();
    typeDraft("Cảm ơn bạn rất nhiều");

    fireEvent.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));
    expect(editor()?.textContent).toBe("Cảm ơn bạn rất nhiều");

    closePanel();

    expect(rulesPanel()).not.toBeInTheDocument();
    expect(editor()?.textContent).toBe("Cảm ơn bạn rất nhiều");
  });

  it("gives Escape to the panel only, leaving the dialog open", () => {
    // Both modals listen for Escape — the dialog on `document`, the panel on
    // `window` — so one press used to close the pair.
    setup();
    typeDraft("bản nháp");
    fireEvent.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.keyDown(window, { key: "Escape" });

    expect(rulesPanel()).not.toBeInTheDocument();
    expect(editor()?.textContent).toBe("bản nháp");
  });

  it("releases the body scroll lock only once both are closed", () => {
    setup();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Tiêu chuẩn cộng đồng" }));
    closePanel();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /Hủy/ }));
    expect(document.body.style.overflow).toBe("");
  });
});
