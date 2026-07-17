import { getLocale, getTranslations } from "next-intl/server";
import LoginHeader from "@/components/login/login-header";
import HeroContent from "@/components/login/hero-content";
import LoginFooter from "@/components/login/login-footer";
import type { Locale } from "@/components/login/language-selector";

/**
 * SAA 2025 Login screen. Server component
 */
export default async function LoginPage({
  searchParams,
}: {
  // searchParams is a Promise in Next.js 16 (async request APIs).
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("LoginPage");
  const errorText = error === "auth" ? t("errorText") : undefined;

  return (
    <div
      className="flex min-h-screen w-full flex-col bg-ink bg-cover bg-right"
      style={{ backgroundImage: "url(/images/login/hero-bg.svg)" }}
    >
      <div className="absolute inset-0 z-1 bg-[linear-gradient(90deg,var(--color-ink)_0%,var(--color-ink)_25.41%,rgba(0,16,26,0)_100%)]" />
      <div className="absolute bottom-0 left-0 right-0 z-1 h-100 bg-[linear-gradient(0deg,var(--color-ink)_0%,rgba(0,19,32,0)_70%)]" />
      <LoginHeader current={locale} />
      <HeroContent
        subtitle={t("subtitle")}
        tagline={t("tagline")}
        buttonLabel={t("googleButton")}
        errorText={errorText}
      />
      <LoginFooter text={t("footer")} />
    </div>
  );
}
