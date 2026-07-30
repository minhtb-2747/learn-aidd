import { createClient } from "@/lib/supabase/server";

/** Header chrome data that needs a database round trip. */
export interface HeaderData {
  isAdmin: boolean;
  unreadCount: number;
}

/** Safe defaults — the header must never be the reason a page fails to render. */
const FALLBACK: HeaderData = { isAdmin: false, unreadCount: 0 };

/**
 * Resolve the two header values that live in the database: whether the viewer
 * is an admin, and how many unread notifications they have.
 *
 * Both queries run in one `Promise.all` so this costs a single round trip's
 * worth of latency on every page that renders the header.
 *
 * Failure policy: on any error this returns `FALLBACK` rather than throwing.
 * The header is chrome — degrading it to "not admin, nothing unread" is far
 * better than 500-ing a page whose actual content loaded fine.
 *
 * `notifications_select` is owner-scoped in the database, so the `user_id`
 * filter below is an optimisation, not the security boundary — RLS is.
 */
export async function getHeaderData(userId: string): Promise<HeaderData> {
  try {
    const supabase = await createClient();

    const [roleResult, unreadResult] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false),
    ]);

    return {
      // A missing profiles row is tolerated (treated as a non-admin). If this
      // happens for freshly signed-in users, suspect the `handle_new_user`
      // trigger rather than this call site.
      isAdmin: roleResult.data?.role === "admin",
      unreadCount: unreadResult.count ?? 0,
    };
  } catch {
    return FALLBACK;
  }
}
