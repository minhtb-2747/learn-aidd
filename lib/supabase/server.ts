import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for RSC, Route Handlers, and Server Actions.
 *
 * Uses the intentionally un-prefixed env vars (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY)
 * so no key ever reaches the browser bundle — all auth happens server-side.
 * `cookies()` is async in Next.js 16 (no sync fallback), hence the `await`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` was called from a Server Component render, where cookies
            // are read-only. The proxy's updateSession refreshes the session
            // cookie instead, so this is safe to ignore.
          }
        },
      },
    },
  );
}
