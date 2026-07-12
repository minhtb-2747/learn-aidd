"use server";

import { cookies } from "next/headers";
import { isLocale } from "@/i18n/config";

/**
 * Persist the chosen UI locale in the `NEXT_LOCALE` cookie (cookie-mode i18n).
 * The client calls `router.refresh()` afterwards so the whole tree re-renders
 * in the new language.
 */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
