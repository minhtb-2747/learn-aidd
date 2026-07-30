/**
 * Shared sanitiser for the post-login `?next=` destination.
 *
 * The value travels user-controlled from `proxy.ts` → `/login?next=…` → a hidden
 * form field → the OAuth `redirectTo` → `/auth/callback?next=…`, so it is
 * validated at the point of USE rather than trusted anywhere along the way.
 *
 * Only same-origin absolute PATHS are allowed. Rejected:
 *  - `//evil.com` and `///evil.com` — protocol-relative URLs the browser treats
 *    as another origin;
 *  - `https://evil.com` — any scheme;
 *  - `\\evil.com` — backslashes, which some browsers normalise to `/`;
 *  - anything not starting with `/`.
 * Anything rejected falls back to the app root, never to an error.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  // Protocol-relative (`//host`) or backslash-smuggled (`/\host`) targets.
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
