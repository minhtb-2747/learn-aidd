"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { searchSunners, type SunnerOption } from "@/lib/kudos/queries/people";
import { extractMentionCandidates } from "@/lib/kudos/parse-mentions";
import {
  validateCreateKudosInput,
  resolveMentionIds,
  linkHashtags,
  insertKudoImages,
  type CreateKudosInput,
} from "@/lib/kudos/create-kudos-helpers";

// NOTE: never `export type { X }` from a "use server" module. Next's transform
// emits a runtime binding for every export, and a type has no runtime value, so
// the module throws "X is not defined" on every page that loads it. `tsc` and
// `next build` both pass, which is what makes this one nasty. Import the type
// from its own module instead. Plain `export type X = …` aliases are fine.

const SEARCH_QUERY_MAX_LENGTH = 100;
const SEARCH_RESULT_LIMIT = 20;

/**
 * Server-action wrapper over `searchSunners` for the composer's recipient
 * select. `RecipientSelect` is mounted from the root layout, so no server page
 * can hand it a directory as props — and a client component can never import
 * `lib/kudos/queries/**` (they pull in `next/headers`).
 */
export async function searchSunnersAction(query: string): Promise<SunnerOption[]> {
  try {
    return await searchSunners(query.slice(0, SEARCH_QUERY_MAX_LENGTH), SEARCH_RESULT_LIMIT);
  } catch {
    return [];
  }
}

export type CreateKudosResult = { ok: true; kudoId: string } | { ok: false; error: string };

/**
 * Create a kudos row plus its hashtag links and `@mention` rows.
 *
 * `sender_id` always comes from the session, never the client — `kudos_insert`'s
 * `WITH CHECK (sender_id = auth.uid())` is the authoritative second gate.
 *
 * No cross-call transaction, by design: a failed hashtag/mention insert still
 * leaves the kudos row as valid content. `kudo_received` notifications are NOT
 * written here — `notifications` has no INSERT RLS policy.
 */
export async function createKudos(input: CreateKudosInput): Promise<CreateKudosResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, error: "Bạn cần đăng nhập để gửi Kudos." };

  const validationError = validateCreateKudosInput(input, user.id);
  if (validationError) return { ok: false, error: validationError };

  const title = input.honorTitle.trim();
  const content = input.content.trim();
  const anonymousName = input.isAnonymous ? (input.anonymousName ?? "").trim() : null;

  const { data: kudosRow, error: insertError } = await supabase
    .from("kudos")
    .insert({
      sender_id: user.id,
      receiver_id: input.recipientId,
      title,
      content,
      is_anonymous: input.isAnonymous,
      anonymous_name: anonymousName,
      status: "published",
    })
    .select("id")
    .single();

  if (insertError || !kudosRow) {
    return { ok: false, error: "Không thể gửi Kudos, vui lòng thử lại." };
  }

  const kudoId = (kudosRow as { id: number }).id;

  await linkHashtags(supabase, kudoId, input.hashtags);

  const mentionIds = await resolveMentionIds(supabase, extractMentionCandidates(content), user.id);
  if (mentionIds.length > 0) {
    await supabase
      .from("kudo_mentions")
      .upsert(
        mentionIds.map((mentionedUserId) => ({ kudo_id: kudoId, mentioned_user_id: mentionedUserId })),
        { onConflict: "kudo_id,mentioned_user_id", ignoreDuplicates: true },
      );
  }

  if (input.imageUrls && input.imageUrls.length > 0) {
    await insertKudoImages(supabase, kudoId, input.imageUrls);
  }

  revalidatePath("/kudos");
  revalidatePath("/profile/[id]", "page");

  return { ok: true, kudoId: String(kudoId) };
}
