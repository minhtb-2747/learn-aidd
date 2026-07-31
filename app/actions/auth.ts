"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * App origin for OAuth redirect URLs. Whatever this returns must appear in
 * `supabase/config.toml`'s `[auth] additional_redirect_urls`, or GoTrue rejects
 * the callback. The fallback tracks the dev port in package.json.
 */
async function resolveOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const hdrs = await headers();
  return hdrs.get("origin") ?? "http://localhost:3333";
}

/**
 * Start the Google OAuth flow server-side.
 *
 * `formData`'s hidden `next` field traces back to the `?next=` that `proxy.ts`
 * attaches when bouncing an unauthenticated user, which is what makes
 * deep-linking work — sign in from /kudos and land back on /kudos. It is
 * user-controlled, hence `safeNext` before it reaches `redirectTo`.
 *
 * `redirect()` throws NEXT_REDIRECT, so it MUST stay outside any try/catch or
 * the redirect is swallowed as an error.
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
