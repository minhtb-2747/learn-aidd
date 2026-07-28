import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  MOCK_AUTH_COOKIE,
  MOCK_USER,
  hasMockAuth,
} from "@/lib/auth/mock-session";

/**
 * Plain, serializable view-model for the homepage header. Server-only —
 * never pass the raw Supabase user/session object across the server/client
 * boundary, only these display fields.
 */
export interface HeaderViewModel {
  isAuthenticated: boolean;
  user: {
    name: string;
    avatarUrl: string | null;
  } | null;
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
 * Auth state and profile fields come from the real Supabase session. The
 * role and notification fields are mock — there is no roles/notifications
 * backend yet — and are documented as such below.
 */
export async function getHeaderViewModel(): Promise<HeaderViewModel> {
  // TEMPORARY: honor the mock-auth cookie (login stub) before hitting Supabase.
  const cookieStore = await cookies();
  if (hasMockAuth(cookieStore.get(MOCK_AUTH_COOKIE)?.value)) {
    return {
      isAuthenticated: true,
      user: { name: MOCK_USER.name, avatarUrl: null },
      isAdmin: false,
      notifications: { unreadCount: 0 },
    };
  }

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

  return {
    isAuthenticated: true,
    user: {
      name: resolveDisplayName(metadata, user.email),
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
    },
    // mock — no roles/notifications backend yet
    isAdmin: false,
    notifications: { unreadCount: 0 },
  };
}
