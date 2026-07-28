import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { MOCK_AUTH_COOKIE, MOCK_USER, hasMockAuth } from "@/lib/auth/mock-session";

/**
 * Refreshes the Supabase auth session on every matched request and returns the
 * authenticated user (or null). Called from the root `proxy.ts` (Next.js 16's
 * rename of `middleware.ts`).
 *
 * Contract: there must be NO logic between `createServerClient` and
 * `auth.getUser()` — Supabase relies on that ordering to rotate cookies safely.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TEMPORARY: treat a mock-auth cookie (login stub) as an authenticated user
  // so route gating in proxy.ts works without a real Supabase session.
  const effectiveUser =
    user ??
    (hasMockAuth(request.cookies.get(MOCK_AUTH_COOKIE)?.value)
      ? { id: MOCK_USER.id }
      : null);

  return { supabaseResponse, user: effectiveUser };
}
