/**
 * Server-side config helper resolving the SAA 2025 event target date/time.
 *
 * No `NEXT_PUBLIC_` prefix: this is read server-side only, and the resolved
 * ISO string is passed down to the client countdown component as a prop.
 */

/**
 * Read and parse `EVENT_DATETIME` from the environment.
 *
 * Returns `null` when the variable is unset or does not parse as a valid
 * ISO-8601 date/time — never throws, so a misconfigured/missing env falls
 * back to the "event passed" countdown state instead of crashing the page.
 */
export function getEventDateTime(): Date | null {
  const raw = process.env.EVENT_DATETIME;
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}
