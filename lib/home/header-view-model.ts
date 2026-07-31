import { createClient } from "@/lib/supabase/server";
import { getHeaderData } from "@/lib/home/header-queries";

/**
 * Plain, serializable view-model for the homepage header. Server-only —
 * never pass the raw Supabase user/session object across the server/client
 * boundary, only these display fields.
 */
export interface HeaderViewModel {
  isAuthenticated: boolean;
  user: {
    /** Profile uuid — doubles as the `/profile/[id]` route key. */
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  /**
   * DISPLAY flag only — it decides whether the admin menu item is rendered.
   * It is NOT an authorization gate: any future admin route must do its own
   * server-side `profiles.role` check and rely on RLS.
   */
  isAdmin: boolean;
  notifications: {
    unreadCount: number;
  };
}

/** Best-effort display name from Supabase user metadata, falling back to email. */
function resolveDisplayName(metadata: Record<string, unknown>, email: string | undefined): string {
  const fullName = metadata.full_name;
  if (typeof fullName === "string" && fullName.length > 0) return fullName;

  const name = metadata.name;
  if (typeof name === "string" && name.length > 0) return name;

  return email ?? "";
}

/**
 * Resolve the homepage header's auth-aware view-model.
 *
 * Every field is backed by real data: auth state and display name from the
 * Supabase session, `isAdmin` from `profiles.role`, and the unread count from
 * `notifications` (see `getHeaderData`). Signed-out requests short-circuit
 * before any database query runs.
 */
export async function getHeaderViewModel(): Promise<HeaderViewModel> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
      isAdmin: false,
      notifications: { unreadCount: 0 },
    };
  }

  const metadata = user.user_metadata ?? {};
  const avatarUrl = metadata.avatar_url;
  const { isAdmin, unreadCount } = await getHeaderData(user.id);

  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      name: resolveDisplayName(metadata, user.email),
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
    },
    isAdmin,
    notifications: { unreadCount },
  };
}
