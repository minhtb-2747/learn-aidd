"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** Resolve the app origin for OAuth redirect URLs (server-side env first). */
async function resolveOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const hdrs = await headers();
  return hdrs.get("origin") ?? "http://localhost:3000";
}

/**
 * Start the Google OAuth flow server-side. Supabase returns the provider URL;
 * we hand off to it with `redirect()`.
 *
 * `redirect()` works by throwing NEXT_REDIRECT, so it MUST stay outside any
 * try/catch — otherwise the redirect gets swallowed as an error.
 */
export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = await resolveOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/todo`,
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
