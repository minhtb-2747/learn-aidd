"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { MOCK_AUTH_COOKIE, MOCK_AUTH_VALUE } from "@/lib/auth/mock-session";

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
      redirectTo: `${origin}/auth/callback?next=/`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=auth");
  }

  redirect(data.url);
}

/**
 * TEMPORARY sign-in stub. Google OAuth has no provider key yet, so clicking the
 * login button just sets the mock-auth cookie and drops the user into the app.
 * Swap the login form back to `signInWithGoogle` once real OAuth is wired.
 *
 * `redirect()` throws NEXT_REDIRECT, so it stays outside any try/catch.
 */
export async function signInMock() {
  const cookieStore = await cookies();
  cookieStore.set(MOCK_AUTH_COOKIE, MOCK_AUTH_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  redirect("/");
}

/** Sign the user out and return them to the login screen. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Also clear the temporary mock-auth cookie (see signInMock).
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_AUTH_COOKIE);
  redirect("/login");
}
