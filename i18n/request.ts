import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "./config";

/**
 * next-intl request config (cookie mode — no `[locale]` URL segments).
 * The active locale is read from the `NEXT_LOCALE` cookie and falls back to
 * `defaultLocale` (vi) when the cookie is missing or invalid.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
