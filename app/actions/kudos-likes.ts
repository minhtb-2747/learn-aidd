"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getActiveCampaign } from "@/lib/kudos/queries/engagement";

export type ToggleKudoLikeResult =
  | { ok: true; liked: boolean; heartValue: number }
  | { ok: false; error: string };

/** `kudos.id` is a bigint rendered as a string on the client. */
const KUDO_ID_PATTERN = /^[1-9][0-9]*$/;
const UNIQUE_VIOLATION_CODE = "23505";

/**
 * Toggle the user's like: insert a `kudo_likes` row if absent, delete if present.
 *
 * `kudos.like_count` is NEVER written here — `trg_update_like_count` owns it
 * exclusively, and writing it from here would double-count.
 *
 * `uq_kudo_like` turns a double-click race into a `23505`, which is treated as
 * "already liked" rather than surfaced as an error.
 */
export async function toggleKudoLike(kudoId: string): Promise<ToggleKudoLikeResult> {
  if (!KUDO_ID_PATTERN.test(kudoId)) {
    return { ok: false, error: "ID Kudos không hợp lệ." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, error: "Bạn cần đăng nhập để thích bài viết này." };
  }

  const numericKudoId = Number(kudoId);

  const { data: existing, error: existingError } = await supabase
    .from("kudo_likes")
    .select("id, heart_value")
    .eq("kudo_id", numericKudoId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: "Không thể cập nhật lượt thích, vui lòng thử lại." };
  }

  let result: ToggleKudoLikeResult;

  if (existing) {
    const existingRow = existing as { id: number; heart_value: number };
    const { error: deleteError } = await supabase
      .from("kudo_likes")
      .delete()
      .eq("id", existingRow.id);
    if (deleteError) {
      return { ok: false, error: "Không thể bỏ thích, vui lòng thử lại." };
    }
    result = { ok: true, liked: false, heartValue: existingRow.heart_value };
  } else {
    // The one place `heart_value` becomes real.
    const campaign = await getActiveCampaign().catch(() => null);
    const heartValue = campaign?.heartMultiplier ?? 1;

    const { error: insertError } = await supabase.from("kudo_likes").insert({
      kudo_id: numericKudoId,
      user_id: user.id,
      heart_value: heartValue,
      is_special_day: campaign !== null,
    });

    if (insertError) {
      const code = (insertError as { code?: string }).code;
      if (code === UNIQUE_VIOLATION_CODE) {
        result = { ok: true, liked: true, heartValue };
      } else {
        return { ok: false, error: "Không thể thích bài viết, vui lòng thử lại." };
      }
    } else {
      result = { ok: true, liked: true, heartValue };
    }
  }

  revalidatePath("/kudos");
  revalidatePath("/profile/[id]", "page");
  return result;
}
