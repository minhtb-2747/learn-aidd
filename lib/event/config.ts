/**
 * Resolves the event target date/time. No `NEXT_PUBLIC_` prefix — read
 * server-side only; the ISO string reaches the client as a prop.
 */

/**
 * Parse `EVENT_DATETIME`. Returns `null` when unset or unparseable — never
 * throws, so a misconfigured env degrades to "event passed" instead of a crash.
 */
export function getEventDateTime(): Date | null {
  const raw = process.env.EVENT_DATETIME;
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}
