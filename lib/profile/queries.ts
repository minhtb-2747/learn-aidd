import { createClient } from "@/lib/supabase/server";
import { getPeopleMeta } from "@/lib/kudos/queries/people";
import { KUDOS_SELECT, getCurrentUserLikes } from "@/lib/kudos/queries/kudos-feed";
import { toKudosPost, type KudosRow } from "@/lib/kudos/kudos-mapper";
import type { ProfileKudosPost, ProfilePerson } from "@/lib/profile/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Guards non-UUID `[id]` route params so a junk value can never reach Postgres (and its schema-hint error text). */
function isValidUuid(id: string): boolean {
  return UUID_PATTERN.test(id);
}

interface ProfileRow {
  id: string;
  full_name: string;
  departments: { name: string } | null;
}

/** Profile by id, enriched with tier/stars/received/sent via the shared `getPeopleMeta`. `null` for a missing or malformed id — the page turns that into `notFound()`. */
export async function getProfileById(id: string): Promise<ProfilePerson | null> {
  if (!isValidUuid(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, departments(name)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as ProfileRow;
  const meta = await getPeopleMeta([row.id]);
  const person = meta.get(row.id);

  return {
    profileId: row.id,
    name: row.full_name,
    department: row.departments?.name ?? "",
    badge: person?.badge ?? "",
    kudosReceived: person?.kudosReceived ?? 0,
    kudosSent: person?.kudosSent ?? 0,
  };
}

/**
 * "Đã gửi"/"Đã nhận" post lists, mapped through the shared `toKudosPost`
 * mapper. `sent` has no status filter so the owner sees their own spam rows
 * (RLS still hides other people's non-published kudos); `received` is
 * published-only.
 */
export async function getProfileKudos(
  id: string,
  filter: "sent" | "received",
  limit = 10,
): Promise<ProfileKudosPost[]> {
  if (!isValidUuid(id)) return [];

  const supabase = await createClient();
  let query = supabase.from("kudos").select(KUDOS_SELECT).is("deleted_at", null);
  query =
    filter === "sent"
      ? query.eq("sender_id", id)
      : query.eq("receiver_id", id).eq("status", "published");

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;

  const rows = (data ?? []) as unknown as KudosRow[];
  if (rows.length === 0) return [];

  const profileIds = new Set<string>();
  for (const row of rows) {
    if (!row.is_anonymous) profileIds.add(row.sender_id);
    profileIds.add(row.receiver_id);
  }

  const [peopleMeta, likedByCurrentUser] = await Promise.all([
    getPeopleMeta(Array.from(profileIds)),
    getCurrentUserLikes(rows.map((row) => String(row.id))),
  ]);

  return rows.map((row) => ({
    post: toKudosPost(row, peopleMeta, likedByCurrentUser),
    isSpam: row.status === "spam",
  }));
}

/** Sent/received totals via two `head: true` counts — no rows cross the wire. */
export async function getProfileCounts(
  id: string,
): Promise<{ sent: number; received: number }> {
  if (!isValidUuid(id)) return { sent: 0, received: 0 };

  const supabase = await createClient();
  const [sentResult, receivedResult] = await Promise.all([
    supabase
      .from("kudos")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", id)
      .is("deleted_at", null),
    supabase
      .from("kudos")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", id)
      .eq("status", "published")
      .is("deleted_at", null),
  ]);
  if (sentResult.error) throw sentResult.error;
  if (receivedResult.error) throw receivedResult.error;

  return { sent: sentResult.count ?? 0, received: receivedResult.count ?? 0 };
}
