import { createClient } from "@/lib/supabase/server";
import type { KudosStats, LeaderboardEntry } from "@/lib/kudos/types";

const ZERO_STATS: KudosStats = {
  kudosReceived: 0,
  kudosSent: 0,
  heartsReceived: 0,
  boxesOpened: 0,
  boxesUnopened: 0,
};

const GIFT_RECIPIENT_LIMIT = 10;

/**
 * Current-user sidebar stats. Counts use `head: true` so no rows cross the
 * wire; `heartsReceived` sums `like_count`, which already includes the heart
 * multipliers. Returns zeros, never throws, when signed out.
 */
export async function getCurrentUserStats(): Promise<KudosStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return ZERO_STATS;

  const [kudosReceived, kudosSent, heartsRows, boxesOpened, boxesUnopened] =
    await Promise.all([
      supabase
        .from("kudos")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("status", "published")
        .is("deleted_at", null),
      supabase
        .from("kudos")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", user.id)
        .is("deleted_at", null),
      supabase
        .from("kudos")
        .select("like_count")
        .eq("receiver_id", user.id)
        .eq("status", "published")
        .is("deleted_at", null),
      supabase
        .from("secret_boxes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_opened", true),
      supabase
        .from("secret_boxes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_opened", false),
    ]);

  for (const result of [kudosReceived, kudosSent, heartsRows, boxesOpened, boxesUnopened]) {
    if (result.error) throw result.error;
  }

  const heartsReceived = ((heartsRows.data ?? []) as { like_count: number }[]).reduce(
    (sum, row) => sum + row.like_count,
    0,
  );

  return {
    kudosReceived: kudosReceived.count ?? 0,
    kudosSent: kudosSent.count ?? 0,
    heartsReceived,
    boxesOpened: boxesOpened.count ?? 0,
    boxesUnopened: boxesUnopened.count ?? 0,
  };
}

/**
 * 10 most-recently-opened secret boxes across all users — needs the
 * `secret_boxes_select_opened` policy, since the base one is owner-scoped.
 * Only names are projected; no `user_id` reaches the view-model.
 */
export async function getGiftRecipients(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("secret_boxes")
    .select("opened_at, profiles(full_name), badges(name)")
    .eq("is_opened", true)
    .order("opened_at", { ascending: false })
    .limit(GIFT_RECIPIENT_LIMIT);
  if (error) throw error;

  interface GiftRow {
    profiles: { full_name: string } | null;
    badges: { name: string } | null;
  }

  return ((data ?? []) as unknown as GiftRow[]).map((row) => ({
    name: row.profiles?.full_name ?? "",
    description: `Nhận được ${row.badges?.name ?? ""}`,
  }));
}

export interface ActiveCampaign {
  heartMultiplier: number;
  name: string;
  startDate: string;
  endDate: string;
}

/** The active campaign (x2 hearts), or `null` when none is running. */
export async function getActiveCampaign(): Promise<ActiveCampaign | null> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("campaigns")
    .select("name, start_date, end_date, heart_multiplier")
    .eq("is_active", true)
    .is("deleted_at", null)
    .lte("start_date", nowIso)
    .gte("end_date", nowIso)
    .limit(1);
  if (error) throw error;

  const row = (data ?? [])[0] as
    | { name: string; start_date: string; end_date: string; heart_multiplier: number }
    | undefined;
  if (!row) return null;

  return {
    heartMultiplier: row.heart_multiplier,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}
