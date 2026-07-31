"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  validateImageFile,
  extensionForImageType,
  type AllowedImageType,
} from "@/lib/kudos/validate-image-file";

const BUCKET = "kudo-images";

export type UploadKudoImageResult =
  | { ok: true; path: string; publicUrl: string }
  | { ok: false; error: string };

/**
 * Uploads one Kudos composer image to the public `kudo-images` Storage
 * bucket. Called from the submit path, once per file: the composer only holds
 * files locally until then, and `next.config.ts` caps server-action bodies at
 * 6 MB, which forbids batching five 5 MB images into one call.
 * Runs as the signed-in user under Storage RLS — no service key — so the
 * object path is the authority the INSERT policy checks against:
 * `(storage.foldername(name))[1] = auth.uid()::text`. The path is always
 * built here from the session's `user.id`, never accepted from the client.
 */
export async function uploadKudoImage(formData: FormData): Promise<UploadKudoImageResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, error: "Bạn cần đăng nhập để tải ảnh lên." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Không tìm thấy tệp ảnh." };

  const validationError = validateImageFile(file);
  if (validationError) return { ok: false, error: validationError };

  const extension = extensionForImageType(file.type as AllowedImageType);
  const path = `${user.id}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) return { ok: false, error: "Tải ảnh lên thất bại, vui lòng thử lại." };

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, path, publicUrl: publicUrlData.publicUrl };
}

export type RemoveKudoImageResult = { ok: true } | { ok: false; error: string };

/**
 * Best-effort rollback for a submit that uploaded one or more objects but
 * whose `kudos` row never landed — see `upload-kudos-images.ts`. Removing a
 * thumbnail before submit needs nothing from the server: that file was never
 * uploaded in the first place.
 * The `{auth.uid()}/...` prefix check mirrors the DELETE Storage policy so a
 * tampered path is rejected here too, not only by RLS.
 */
export async function removeKudoImage(path: string): Promise<RemoveKudoImageResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, error: "Bạn cần đăng nhập." };

  if (!path.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Không có quyền xóa ảnh này." };
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return { ok: false, error: "Xóa ảnh thất bại." };
  return { ok: true };
}
