import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ImageUploader, { type PendingImage } from "@/components/kudos/image-uploader";

// jsdom implements neither, and the component revokes every preview it creates.
const createObjectURL = vi.fn(() => `blob:mock-${createObjectURL.mock.calls.length}`);
const revokeObjectURL = vi.fn();
beforeEach(() => {
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  Object.assign(URL, { createObjectURL, revokeObjectURL });
});

function imageFile(name: string, type = "image/png", size = 1024) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function tile(id: string): PendingImage {
  return { id, file: imageFile(`${id}.png`), previewUrl: `blob:${id}` };
}

function setup(value: PendingImage[] = [], max = 5) {
  const onChange = vi.fn();
  const view = render(
    <ImageUploader
      label="Image"
      addLabel="+ Image"
      maxLabel={`Tối đa ${max}`}
      removeAriaLabel="Xoá ảnh"
      value={value}
      onChange={onChange}
      max={max}
    />,
  );
  return { onChange, input: view.container.querySelector("input[type=file]")!, ...view };
}

describe("ImageUploader", () => {
  it("offers the add button while under the cap", () => {
    setup([tile("a")], 2);
    expect(screen.getByText("+ Image")).toBeInTheDocument();
  });

  it("hides the add button once the cap is reached", () => {
    setup([tile("a"), tile("b")], 2);
    expect(screen.queryByText("+ Image")).not.toBeInTheDocument();
  });

  it("turns picked files into pending tiles with local previews", () => {
    const { onChange, input } = setup();
    fireEvent.change(input, { target: { files: [imageFile("a.png")] } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as PendingImage[];
    expect(next).toHaveLength(1);
    expect(next[0].previewUrl).toMatch(/^blob:/);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("reads the FileList BEFORE the input is cleared", () => {
    // `input.files` is live: clearing `value` first empties the very object the
    // handler holds, and the picker would silently do nothing.
    const { onChange, input } = setup();
    fireEvent.change(input, { target: { files: [imageFile("a.png")] } });

    expect(onChange).toHaveBeenCalled();
    expect((onChange.mock.calls[0][0] as PendingImage[])).toHaveLength(1);
  });

  it("applies a multi-file pick as ONE onChange carrying every file", () => {
    // `value` here is a plain array, not a state updater — calling onChange per
    // file would build each batch off the same stale value and keep only the last.
    const { onChange, input } = setup();
    fireEvent.change(input, {
      target: { files: [imageFile("a.png"), imageFile("b.png"), imageFile("c.png")] },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toHaveLength(3);
  });

  it("appends to what is already held rather than replacing it", () => {
    const existing = [tile("a")];
    const { onChange, input } = setup(existing);
    fireEvent.change(input, { target: { files: [imageFile("b.png")] } });

    const next = onChange.mock.calls[0][0] as PendingImage[];
    expect(next).toHaveLength(2);
    expect(next[0].id).toBe("a");
  });

  it("only takes as many files as the remaining slots allow", () => {
    const { onChange, input } = setup([tile("a"), tile("b")], 3);
    fireEvent.change(input, {
      target: { files: [imageFile("c.png"), imageFile("d.png"), imageFile("e.png")] },
    });

    expect(onChange.mock.calls[0][0]).toHaveLength(3);
  });

  it("reports a per-file error and keeps the valid ones", () => {
    const { onChange, input } = setup();
    fireEvent.change(input, {
      target: { files: [imageFile("ok.png"), imageFile("bad.pdf", "application/pdf")] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("bad.pdf");
    expect(onChange.mock.calls[0][0]).toHaveLength(1);
  });

  it("rejects an oversized file without creating a preview for it", () => {
    const { onChange, input } = setup();
    fireEvent.change(input, {
      target: { files: [imageFile("huge.png", "image/png", 6 * 1024 * 1024)] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("huge.png");
    expect(onChange).not.toHaveBeenCalled();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("revokes the preview of a removed tile", () => {
    const { onChange } = setup([tile("a"), tile("b")]);
    fireEvent.click(screen.getAllByLabelText("Xoá ảnh")[0]);

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:a");
    expect(onChange.mock.calls[0][0]).toEqual([expect.objectContaining({ id: "b" })]);
  });

  it("revokes every held preview on unmount, so nothing leaks", () => {
    const { unmount } = setup([tile("a"), tile("b")]);
    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:a");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:b");
  });
});
