import { createClient } from "@/lib/supabase/server";
import { heroTierForSenderCount, starsForBadge } from "@/lib/kudos/hero-tier";

export interface PersonMeta {
  name: string;
  department: string;
  badge: string;
  stars: number;
  kudosReceived: number;
  kudosSent: number;
}

export interface SunnerOption {
  id: string;
  name: string;
  department: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
  departments: { name: string } | null;
}

interface KudosPairRow {
  sender_id: string;
  receiver_id: string;
}

/**
 * Batched tier/received/sent lookup — always TWO queries no matter how many ids,
 * to avoid an N+1 over per-card hover data. Aggregation happens in TS, which is
 * correct at current scale; a SQL view is the scale-up path.
 */
export async function getPeopleMeta(
  profileIds: string[],
): Promise<Map<string, PersonMeta>> {
  if (profileIds.length === 0) return new Map();

  const supabase = await createClient();
  const uniqueIds = Array.from(new Set(profileIds));
  const idList = uniqueIds.join(",");

  const [profilesResult, kudosResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, departments(name)")
      .in("id", uniqueIds),
    supabase
      .from("kudos")
      .select("sender_id, receiver_id")
      .eq("status", "published")
      .is("deleted_at", null)
      .or(`sender_id.in.(${idList}),receiver_id.in.(${idList})`),
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (kudosResult.error) throw kudosResult.error;

  const profiles = (profilesResult.data ?? []) as unknown as ProfileRow[];
  const pairs = (kudosResult.data ?? []) as KudosPairRow[];

  const sendersByReceiver = new Map<string, Set<string>>();
  const receivedCountByReceiver = new Map<string, number>();
  const sentCountBySender = new Map<string, number>();

  for (const pair of pairs) {
    if (!sendersByReceiver.has(pair.receiver_id)) {
      sendersByReceiver.set(pair.receiver_id, new Set());
    }
    sendersByReceiver.get(pair.receiver_id)!.add(pair.sender_id);

    receivedCountByReceiver.set(
      pair.receiver_id,
      (receivedCountByReceiver.get(pair.receiver_id) ?? 0) + 1,
    );
    sentCountBySender.set(
      pair.sender_id,
      (sentCountBySender.get(pair.sender_id) ?? 0) + 1,
    );
  }

  const result = new Map<string, PersonMeta>();
  for (const profile of profiles) {
    const distinctSenders = sendersByReceiver.get(profile.id)?.size ?? 0;
    const badge = heroTierForSenderCount(distinctSenders);
    result.set(profile.id, {
      name: profile.full_name,
      department: profile.departments?.name ?? "",
      badge: badge ?? "",
      stars: starsForBadge(badge ?? ""),
      kudosReceived: receivedCountByReceiver.get(profile.id) ?? 0,
      kudosSent: sentCountBySender.get(profile.id) ?? 0,
    });
  }

  return result;
}

/**
 * Directory search for the recipient select. Empty query returns the first
 * `limit` alphabetically; `.ilike` binds the query as a parameter, never
 * concatenated SQL.
 */
export async function searchSunners(
  query: string,
  limit = 20,
): Promise<SunnerOption[]> {
  const supabase = await createClient();
  let builder = supabase
    .from("profiles")
    .select("id, full_name, departments(name)")
    .is("deleted_at", null)
    .order("full_name", { ascending: true })
    .limit(limit);

  const trimmed = query.trim();
  if (trimmed.length > 0) {
    builder = builder.ilike("full_name", `%${trimmed}%`);
  }

  const { data, error } = await builder;
  if (error) throw error;

  return ((data ?? []) as unknown as ProfileRow[]).map((row) => ({
    id: row.id,
    name: row.full_name,
    department: row.departments?.name ?? "",
  }));
}
