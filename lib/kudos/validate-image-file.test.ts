import { describe, expect, it } from "vitest";
import {
  ALLOWED_IMAGE_TYPES,
  extensionForImageType,
  MAX_IMAGES,
  validateImageFile,
  type AllowedImageType,
} from "./validate-image-file";

const MB = 1024 * 1024;

/**
 * This module runs twice per upload — client-side for feedback, server-side as
 * the real gate — and it mirrors the Storage bucket's own limits. If it drifts,
 * a file passes here and the bucket rejects it with no useful message.
 */
describe("validateImageFile", () => {
  it.each(ALLOWED_IMAGE_TYPES)("accepts %s under the size cap", (type) => {
    expect(validateImageFile({ type, size: 1 * MB })).toBeNull();
  });

  it("accepts a file exactly at 5MB", () => {
    expect(validateImageFile({ type: "image/png", size: 5 * MB })).toBeNull();
  });

  it("rejects one byte over 5MB", () => {
    expect(validateImageFile({ type: "image/png", size: 5 * MB + 1 })).toBe(
      "Kích thước ảnh tối đa 5MB.",
    );
  });

  it.each(["image/svg+xml", "image/bmp", "application/pdf", "text/html", ""])(
    "rejects the disallowed type %s",
    (type) => {
      expect(validateImageFile({ type, size: 1 })).toBe(
        "Chỉ hỗ trợ ảnh định dạng JPEG, PNG, GIF hoặc WEBP.",
      );
    },
  );

  it("checks the type before the size, so a huge PDF names the type problem", () => {
    expect(validateImageFile({ type: "application/pdf", size: 900 * MB })).toContain(
      "định dạng",
    );
  });

  it("mirrors the bucket's allow-list exactly", () => {
    // Bucket: allowed_mime_types = {image/jpeg, image/png, image/gif, image/webp}
    expect([...ALLOWED_IMAGE_TYPES]).toEqual([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ]);
  });
});

describe("extensionForImageType", () => {
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/gif", "gif"],
    ["image/webp", "webp"],
  ] as [AllowedImageType, string][])("names %s files .%s", (type, ext) => {
    expect(extensionForImageType(type)).toBe(ext);
  });

  it("covers every allowed type — a new type must not produce `undefined`", () => {
    for (const type of ALLOWED_IMAGE_TYPES) {
      expect(extensionForImageType(type)).toBeTruthy();
    }
  });
});

describe("MAX_IMAGES", () => {
  it("is the 5 the composer and the server both cap at", () => {
    expect(MAX_IMAGES).toBe(5);
  });
});
