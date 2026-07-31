import { createClient } from "@/lib/supabase/server";
import { formatTickerTime } from "@/lib/kudos/format-kudos-time";
import type { SpotlightEntry, TickerLine } from "@/lib/kudos/types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const ENTRY_CAP = 40;
const TICKER_CAP = 5;

export interface SpotlightData {
  entries: SpotlightEntry[];
  ticker: TickerLine[];
  totalKudos: number;
}

/** One row of the `spotlight_receiver_counts` view — already aggregated in SQL. */
interface ReceiverCountRow {
  receiver_id: string;
  kudos_count: number;
  last_received_at: string;
}

interface TickerRow {
  id: number;
  receiver_id: string;
  created_at: string;
}

async function getNamesById(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const unique = Array.from(new Set(ids));
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);
  if (error) throw error;

  return new Map(
    ((data ?? []) as { id: string; full_name: string }[]).map((row) => [
      row.id,
      row.full_name,
    ]),
  );
}

/**
 * Spotlight word-cloud data: per-receiver kudos counts + most recent receipt
 * (aggregated in TS from `receiver_id, created_at` — PostgREST can't express
 * `count(distinct ...)` grouped), the 5-newest ticker, and the total
 * published-kudos count. Layout/placement math lives separately in
 * `spotlight-layout.ts` so the seeded scatter stays untouched.
 */
export async function getSpotlightData(): Promise<SpotlightData> {
  const supabase = await createClient();

  const [receivedResult, tickerResult, countResult] = await Promise.all([
    // Aggregated by the `spotlight_receiver_counts` VIEW rather than here.
    // Selecting raw kudos rows and counting in TS would be silently truncated
    // by PostgREST's `max_rows = 1000` once the board passes 1000 published
    // kudos — wrong counts, no error. The view returns one row per receiver, and
    // `ENTRY_CAP` then bounds what the word cloud renders.
    supabase
      .from("spotlight_receiver_counts")
      .select("receiver_id, kudos_count, last_received_at")
      .order("kudos_count", { ascending: false })
      .limit(ENTRY_CAP),
    supabase
      .from("kudos")
      .select("id, receiver_id, created_at")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(TICKER_CAP),
    supabase
      .from("kudos")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
  ]);

  if (receivedResult.error) throw receivedResult.error;
  if (tickerResult.error) throw tickerResult.error;
  if (countResult.error) throw countResult.error;

  // Already grouped, ordered and capped by the view + query above.
  const countRows = (receivedResult.data ?? []) as ReceiverCountRow[];
  const namesById = await getNamesById(
    supabase,
    countRows.map((row) => row.receiver_id),
  );

  const entries: SpotlightEntry[] = countRows.map((row) => ({
    profileId: row.receiver_id,
    name: namesById.get(row.receiver_id) ?? "",
    kudosCount: row.kudos_count,
    receivedAt: formatTickerTime(row.last_received_at),
  }));

  const tickerRows = (tickerResult.data ?? []) as TickerRow[];
  const tickerNamesById = await getNamesById(
    supabase,
    tickerRows.map((row) => row.receiver_id),
  );
  const ticker: TickerLine[] = tickerRows.map((row) => ({
    id: String(row.id),
    time: formatTickerTime(row.created_at),
    name: tickerNamesById.get(row.receiver_id) ?? "",
  }));

  return { entries, ticker, totalKudos: countResult.count ?? 0 };
}
