/**
 * TEMPORARY mock authentication.
 *
 * Google OAuth isn't wired yet (no provider key), so the login button simply
 * sets this cookie and the whole app treats the request as one fixed demo
 * user. Pure module — no `next/headers` import — so it is safe to pull into
 * both server components and the middleware (`proxy.ts`).
 *
 * To restore real Supabase-only auth: point the login form back at
 * `signInWithGoogle`, then drop the `hasMockAuth` short-circuits in
 * `updateSession`, `getHeaderViewModel`, and `app/todo/page.tsx`.
 */
export const MOCK_AUTH_COOKIE = "saa_mock_auth";
export const MOCK_AUTH_VALUE = "1";

export interface MockUser {
  id: string;
  email: string;
  name: string;
}

/** The single demo identity every mock-authenticated request resolves to. */
export const MOCK_USER: MockUser = {
  id: "mock-user",
  email: "demo@sun-asterisk.com",
  name: "SAA Demo",
};

/** True when a raw cookie value is our mock-auth sentinel. */
export function hasMockAuth(value: string | undefined): boolean {
  return value === MOCK_AUTH_VALUE;
}
