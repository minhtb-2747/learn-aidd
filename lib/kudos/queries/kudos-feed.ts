import { createClient } from "@/lib/supabase/server";
import type { KudosRow } from "@/lib/kudos/kudos-mapper";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Shared select shape for every kudos list — one definition, reused by the
 * board feed and the profile sent/received lists — producing exactly the
 * `KudosRow` shape `kudos-mapper.ts` expects.
 */
export const KUDOS_SELECT =
  "id, sender_id, receiver_id, title, content, is_anonymous, anonymous_name, " +
  "status, like_count, created_at, " +
  "kudo_hashtags(hashtags(name)), kudo_images(image_url, display_order)";

export interface KudosFeedFilters {
  hashtag?: string;
  department?: string;
}

/**
 * Two-step id resolution (resolve matching kudo ids, then filter by id) —
 * chosen over a deep embedded `kudo_hashtags.hashtags.name` filter because
 * PostgREST's embedded-filter syntax for nested relations is fragile;
 * correctness over cleverness here.
 */
async function resolveHashtagKudoIds(
  supabase: SupabaseClient,
  hashtag: string,
): Promise<number[]> {
  const name = hashtag.replace(/^#/, "");
  const { data: tagRows, error: tagError } = await supabase
    .from("hashtags")
    .select("id")
    .eq("name", name)
    .limit(1);
  if (tagError) throw tagError;

  const tagId = (tagRows as { id: number }[] | null)?.[0]?.id;
  if (!tagId) return [];

  const { data: linkRows, error: linkError } = await supabase
    .from("kudo_hashtags")
    .select("kudo_id")
    .eq("hashtag_id", tagId);
  if (linkError) throw linkError;

  return ((linkRows ?? []) as { kudo_id: number }[]).map((row) => row.kudo_id);
}

/** Same two-step approach for department: resolve receiver ids in that department, then filter. */
async function resolveDepartmentReceiverIds(
  supabase: SupabaseClient,
  department: string,
): Promise<string[]> {
  const { data: deptRows, error: deptError } = await supabase
    .from("departments")
    .select("id")
    .eq("name", department)
    .limit(1);
  if (deptError) throw deptError;

  const deptId = (deptRows as { id: number }[] | null)?.[0]?.id;
  if (!deptId) return [];

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("department_id", deptId)
    .is("deleted_at", null);
  if (profileError) throw profileError;

  return ((profileRows ?? []) as { id: string }[]).map((row) => row.id);
}

/**
 * Top-5 published kudos by `like_count`, with optional hashtag/department
 * filters. Returns raw rows — mapping to `HighlightKudos` view-models
 * happens where `getPeopleMeta`/`getCurrentUserLikes` are also available
 * (see phase-04 spec's board read-data-flow).
 */
export async function getHighlightKudos(
  filters?: KudosFeedFilters,
): Promise<KudosRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("kudos")
    .select(KUDOS_SELECT)
    .eq("status", "published")
    .is("deleted_at", null);

  if (filters?.hashtag) {
    const kudoIds = await resolveHashtagKudoIds(supabase, filters.hashtag);
    if (kudoIds.length === 0) return [];
    query = query.in("id", kudoIds);
  }

  if (filters?.department) {
    const receiverIds = await resolveDepartmentReceiverIds(supabase, filters.department);
    if (receiverIds.length === 0) return [];
    query = query.in("receiver_id", receiverIds);
  }

  const { data, error } = await query
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;

  return (data ?? []) as unknown as KudosRow[];
}

/** Newest-first bounded first page — no infinite scroll (explicitly out of scope for this phase). */
export async function getAllKudosPosts(
  { limit = 10 }: { limit?: number } = {},
): Promise<KudosRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos")
    .select(KUDOS_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []) as unknown as KudosRow[];
}

/** Which of `kudoIds` the current session user has liked. Empty Set when there is no session. */
export async function getCurrentUserLikes(kudoIds: string[]): Promise<Set<string>> {
  if (kudoIds.length === 0) return new Set();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("kudo_likes")
    .select("kudo_id")
    .eq("user_id", user.id)
    .in("kudo_id", kudoIds.map(Number));
  if (error) throw error;

  return new Set(((data ?? []) as { kudo_id: number }[]).map((row) => String(row.kudo_id)));
}
