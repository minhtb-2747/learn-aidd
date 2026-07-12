/** Supported UI locales. BCP-47 codes — used by next-intl + the Intl API. */
export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

/** Default locale when no (or an invalid) NEXT_LOCALE cookie is present. */
export const defaultLocale: Locale = "vi";

/**
 * Short display labels for the language selector. These are UI text ONLY —
 * never pass them to next-intl or Intl as locale codes ("VN" is not valid BCP-47).
 */
export const localeLabels: Record<Locale, string> = {
  vi: "VN",
  en: "EN",
};

/** Type guard narrowing an arbitrary cookie value to a supported Locale. */
export function isLocale(value: string | undefined | null): value is Locale {
  return value === "vi" || value === "en";
}
