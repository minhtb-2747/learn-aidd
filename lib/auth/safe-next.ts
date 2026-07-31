/**
 * Sanitiser for the post-login `?next=` destination. The value stays
 * user-controlled all the way from `proxy.ts` to `/auth/callback`, so it is
 * validated at the point of USE, not trusted anywhere along the way.
 *
 * Only same-origin absolute PATHS pass. Rejected: any scheme, protocol-relative
 * `//evil.com`, backslash-smuggled `/\evil.com` (some browsers normalise `\` to
 * `/`), and anything not starting with `/`. Rejects fall back to `/`.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  // Protocol-relative (`//host`) or backslash-smuggled (`/\host`) targets.
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
