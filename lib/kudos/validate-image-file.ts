/**
 * Image-upload validation, run client-side for instant feedback and again
 * server-side as the authoritative gate. Mirrors the `kudo-images` bucket's own
 * constraints exactly (5 MB; jpeg/png/gif/webp) so anything passing here is
 * never rejected by the bucket. Pure and import-free, so the two sides cannot
 * drift apart.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // matches storage.buckets.file_size_limit
export const MAX_IMAGES = 5;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

const EXTENSION_BY_TYPE: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

function isAllowedImageType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

/** Returns a Vietnamese error message, or `null` when the file is acceptable. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!isAllowedImageType(file.type)) {
    return "Chỉ hỗ trợ ảnh định dạng JPEG, PNG, GIF hoặc WEBP.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Kích thước ảnh tối đa 5MB.";
  }
  return null;
}

/** Extension for a validated mime type, used to name the uploaded object. */
export function extensionForImageType(type: AllowedImageType): string {
  return EXTENSION_BY_TYPE[type];
}
