const TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Both formatters pin `timeZone` explicitly so the rendered string never
 * depends on the server process's own timezone — the value is computed
 * server-side and shipped as a plain string prop (no hydration risk), but
 * only if the timezone itself is fixed.
 */
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const tickerFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

function partsToMap(parts: Intl.DateTimeFormatPart[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  return map;
}

/** "HH:mm - MM/DD/YYYY", e.g. "10:00 - 10/30/2025". */
export function formatKudosTime(iso: string): string {
  const parts = partsToMap(dateTimeFormatter.formatToParts(new Date(iso)));
  return `${parts.hour}:${parts.minute} - ${parts.month}/${parts.day}/${parts.year}`;
}

/** Spotlight-ticker form, e.g. "08:30pm" (lowercase, no space before am/pm). */
export function formatTickerTime(iso: string): string {
  const parts = partsToMap(tickerFormatter.formatToParts(new Date(iso)));
  const period = (parts.dayPeriod ?? "").toLowerCase().replace(/\./g, "");
  return `${parts.hour}:${parts.minute}${period}`;
}
