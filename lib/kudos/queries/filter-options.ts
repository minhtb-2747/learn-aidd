import { createClient } from "@/lib/supabase/server";

const HASHTAG_CAP = 30;

/**
 * Highlight-filter hashtag options, "#"-prefixed to match the filter
 * dropdown's display convention (kudos hashtags rendered on cards themselves
 * are unprefixed — see `kudos-mapper.ts`). Public-SELECT table, no session
 * needed.
 */
export async function getHashtagOptions(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hashtags")
    .select("name")
    .order("name", { ascending: true })
    .limit(HASHTAG_CAP);
  if (error) throw error;

  return ((data ?? []) as { name: string }[]).map((row) => `#${row.name}`);
}

/** Highlight-filter department options. Public-SELECT table, no session needed. */
export async function getDepartmentOptions(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("name")
    .order("name", { ascending: true });
  if (error) throw error;

  return ((data ?? []) as { name: string }[]).map((row) => row.name);
}
