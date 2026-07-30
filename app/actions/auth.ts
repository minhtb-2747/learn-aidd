"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * Resolve the app origin for OAuth redirect URLs (server-side env first).
 *
 * Whatever this returns must be present in `supabase/config.toml`'s
 * `[auth] additional_redirect_urls`, or GoTrue rejects the callback. The
 * last-resort fallback tracks the dev port in package.json (`next dev -p 3333`).
 */
async function resolveOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const hdrs = await headers();
  return hdrs.get("origin") ?? "http://localhost:3333";
}

/**
 * Start the Google OAuth flow server-side. Supabase returns the provider URL;
 * we hand off to it with `redirect()`.
 *
 * `formData` carries the hidden `next` field rendered by the login form, which
 * originates from the `?next=` that `proxy.ts` attaches when it bounces an
 * unauthenticated user off a protected route. Threading it through here is what
 * makes deep-linking work: sign in from /kudos and you land back on /kudos, not
 * on the home page. The value is user-controlled, so it is sanitised by
 * `safeNext` before it ever reaches `redirectTo`.
 *
 * `redirect()` works by throwing NEXT_REDIRECT, so it MUST stay outside any
 * try/catch — otherwise the redirect gets swallowed as an error.
 */
export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient();
  const origin = await resolveOrigin();
  const next = safeNext(formData?.get("next")?.toString());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=auth");
  }

  redirect(data.url);
}

/** Sign the user out and return them to the login screen. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
