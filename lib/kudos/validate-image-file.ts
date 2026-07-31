/**
 * Shared image-upload validation for the Kudos composer's `ImageUploader` —
 * used both client-side (immediate UX feedback on file pick) and
 * server-side (the authoritative gate inside the `uploadKudoImage` server
 * action, `app/actions/kudos-images.ts`). Mirrors the live `kudo-images`
 * Storage bucket's own constraints exactly so a file that passes here is
 * never rejected by the bucket itself:
 *   file_size_limit = 5242880 (5 MB)
 *   allowed_mime_types = {image/jpeg, image/png, image/gif, image/webp}
 *
 * Pure module, no imports — keeps client and server validation from ever
 * drifting apart.
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

/** File extension for a validated allowed mime type — used to name the uploaded object. */
export function extensionForImageType(type: AllowedImageType): string {
  return EXTENSION_BY_TYPE[type];
}
