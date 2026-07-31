import { createClient } from "@/lib/supabase/server";

/** Header chrome data that needs a database round trip. */
export interface HeaderData {
  isAdmin: boolean;
  unreadCount: number;
}

/** Safe defaults — the header must never be the reason a page fails to render. */
const FALLBACK: HeaderData = { isAdmin: false, unreadCount: 0 };

/**
 * Admin flag + unread notification count, in one round trip.
 *
 * Returns `FALLBACK` on any error rather than throwing: the header is chrome,
 * and degrading it beats 500-ing a page whose content loaded fine.
 *
 * `notifications_select` is owner-scoped, so the `user_id` filter below is an
 * optimisation — RLS is the security boundary.
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
      // A missing profiles row means non-admin. If that happens for freshly
      // signed-in users, suspect the `handle_new_user` trigger, not this call.
      isAdmin: roleResult.data?.role === "admin",
      unreadCount: unreadResult.count ?? 0,
    };
  } catch {
    return FALLBACK;
  }
}
