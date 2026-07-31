import { createClient } from "@/lib/supabase/server";
import { MAX_IMAGES } from "@/lib/kudos/validate-image-file";

/**
 * Validation + child-row (hashtags/mentions/images) helpers for
 * `createKudos` (`app/actions/kudos.ts`), split into their own module to
 * keep that action file under the 200-line guideline. No `"use server"`
 * here — these are plain functions, not server actions themselves.
 */

export interface CreateKudosInput {
  recipientId: string;
  honorTitle: string;
  content: string;
  hashtags: string[];
  isAnonymous: boolean;
  anonymousName?: string;
  /** Public Storage URLs already uploaded via `uploadKudoImage`, in display order. */
  imageUrls?: string[];
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TITLE_LENGTH = 255;
const MAX_CONTENT_LENGTH = 5000;
const MAX_HASHTAGS = 5;
const MAX_HASHTAG_LENGTH = 50;
const MAX_ANONYMOUS_NAME_LENGTH = 100;
/** Bounds both the generated `or` filter's length and the rows it can return. */
const MENTION_CANDIDATE_CAP = 20;

/** Server-side validation — the client's disabled-button gating is never trusted alone. */
export function validateCreateKudosInput(input: CreateKudosInput, senderId: string): string | null {
  if (!UUID_PATTERN.test(input.recipientId)) return "Vui lòng chọn người nhận hợp lệ.";
  if (input.recipientId === senderId) return "Bạn không thể gửi Kudos cho chính mình.";

  const title = input.honorTitle.trim();
  if (title.length === 0) return "Vui lòng nhập danh hiệu.";
  if (title.length > MAX_TITLE_LENGTH) return `Danh hiệu tối đa ${MAX_TITLE_LENGTH} ký tự.`;

  const content = input.content.trim();
  if (content.length === 0) return "Vui lòng nhập nội dung lời cảm ơn.";
  if (content.length > MAX_CONTENT_LENGTH) return `Nội dung tối đa ${MAX_CONTENT_LENGTH} ký tự.`;

  if (input.hashtags.length === 0) return "Vui lòng thêm ít nhất một hashtag.";
  if (input.hashtags.length > MAX_HASHTAGS) return `Tối đa ${MAX_HASHTAGS} hashtag.`;
  if (input.hashtags.some((tag) => tag.trim().length > MAX_HASHTAG_LENGTH)) {
    return `Mỗi hashtag tối đa ${MAX_HASHTAG_LENGTH} ký tự.`;
  }

  if (input.isAnonymous) {
    const nickname = (input.anonymousName ?? "").trim();
    if (nickname.length === 0) return "Vui lòng nhập nickname ẩn danh.";
    if (nickname.length > MAX_ANONYMOUS_NAME_LENGTH) {
      return `Nickname tối đa ${MAX_ANONYMOUS_NAME_LENGTH} ký tự.`;
    }
  }

  if (input.imageUrls && input.imageUrls.length > MAX_IMAGES) {
    return `Tối đa ${MAX_IMAGES} ảnh.`;
  }

  return null;
}

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Resolve `@mention` candidates to real profile ids by an exact,
 * case-insensitive match against `profiles.full_name` (sender excluded).
 * `profiles` is fully public-select (`profiles_select: USING (true)`), so
 * fetching id+name here leaks nothing a client couldn't already read.
 * Never throws — a lookup failure must not abort the kudos itself.
 */
export async function resolveMentionIds(
  supabase: SupabaseServerClient,
  candidates: string[],
  senderId: string,
): Promise<string[]> {
  if (candidates.length === 0) return [];

  // Push the name filter into the DB instead of scanning every profile.
  // The old full-table `select` was capped by PostgREST's `max_rows = 1000`,
  // so past 1000 profiles mentions would silently stop resolving.
  //
  // Interpolating into an `or` filter is safe for THIS input specifically:
  // `extractMentionCandidates` builds candidates from `[\p{L}\p{M}][\p{L}\p{M}\d]*`
  // words joined by single spaces, so they cannot contain the `,`, `(`, `)` or `.`
  // characters that carry meaning in PostgREST's filter grammar. The guard below
  // re-checks that invariant rather than trusting it, and `ilike` (not `like`)
  // preserves the previous case-insensitive matching.
  const safe = candidates
    .filter((candidate) => /^[\p{L}\p{M}\d]+(?: [\p{L}\p{M}\d]+)*$/u.test(candidate))
    .slice(0, MENTION_CANDIDATE_CAP);
  if (safe.length === 0) return [];

  const wanted = new Set(safe.map((candidate) => candidate.toLowerCase()));
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .is("deleted_at", null)
    .neq("id", senderId)
    .or(safe.map((candidate) => `full_name.ilike.${candidate}`).join(","))
    .limit(MENTION_CANDIDATE_CAP);
  if (error || !data) return [];

  const matches = new Set<string>();
  for (const row of data as { id: string; full_name: string }[]) {
    if (wanted.has(row.full_name.toLowerCase())) matches.add(row.id);
  }
  return Array.from(matches);
}

/**
 * Upsert hashtag names then link them to the kudos row. `hashtags`/
 * `kudo_hashtags` only have INSERT + SELECT RLS policies (no UPDATE), so an
 * `ON CONFLICT DO UPDATE` would be rejected — `ignoreDuplicates: true`
 * (`DO NOTHING`) is required, followed by a plain SELECT to also pick up
 * ids for names that already existed (a skipped-conflict row is not
 * returned by the upsert's own `RETURNING`). Verified against the live RLS
 * policies via psql (see phase-07 implementation report).
 */
export async function linkHashtags(
  supabase: SupabaseServerClient,
  kudoId: number,
  hashtags: string[],
): Promise<void> {
  const names = Array.from(
    new Set(hashtags.map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean)),
  );
  if (names.length === 0) return;

  await supabase
    .from("hashtags")
    .upsert(
      names.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: true },
    );

  const { data: hashtagRows, error } = await supabase.from("hashtags").select("id, name").in("name", names);
  if (error || !hashtagRows) return;

  const links = (hashtagRows as { id: number; name: string }[]).map((row) => ({
    kudo_id: kudoId,
    hashtag_id: row.id,
  }));
  if (links.length === 0) return;

  await supabase
    .from("kudo_hashtags")
    .upsert(links, { onConflict: "kudo_id,hashtag_id", ignoreDuplicates: true });
}

/**
 * Insert one `kudo_images` row per already-uploaded Storage URL, in display
 * order. Images are uploaded (to `kudo-images`) before this runs — this
 * only writes the rows, capped defensively at `MAX_IMAGES` again even
 * though `validateCreateKudosInput` already rejected a longer list.
 * `kudo_images_insert`'s RLS only requires `auth.uid() IS NOT NULL` (no
 * ownership-of-`kudo_id` check), so no extra lookup is needed here. Best
 * effort like `linkHashtags` above: a failure here does not roll back the
 * kudos row itself.
 */
export async function insertKudoImages(
  supabase: SupabaseServerClient,
  kudoId: number,
  imageUrls: string[],
): Promise<void> {
  const urls = imageUrls.slice(0, MAX_IMAGES).filter(Boolean);
  if (urls.length === 0) return;

  const rows = urls.map((imageUrl, index) => ({
    kudo_id: kudoId,
    image_url: imageUrl,
    display_order: index,
  }));

  await supabase.from("kudo_images").insert(rows);
}
