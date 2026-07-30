import Image from "next/image";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/components/login/language-selector";
import { getHeaderViewModel } from "@/lib/home/header-view-model";
import SiteHeader from "@/components/home/site-header";
import AwardHero from "@/components/award-system/award-hero";
import AwardDetailList from "@/components/award-system/award-detail-list";
import KudosSection from "@/components/home/kudos-section";
import WidgetButton from "@/components/home/widget-button";
import SiteFooter from "@/components/home/site-footer";

/**
 * "Hệ thống giải" (Award System) screen: lists the 6 SAA 2025 award
 * categories with a left scroll-spy nav, plus the Sun* Kudos banner. Public
 * server component mirroring `app/page.tsx`'s header/backdrop/footer wiring;
 * the route itself is auth-gated in `proxy.ts` (owned by the orchestrator).
 */
export default async function AwardSystemPage() {
  const [locale, vm, t] = await Promise.all([
    getLocale(),
    getHeaderViewModel(),
    getTranslations("HomePage"),
  ]);

  // Defense-in-depth: the route is already guarded in proxy.ts, but re-verify
  // the Supabase session server-side (the view-model is backed by getUser())
  // so a proxy misconfiguration can never expose this page — mirrors /todo.
  if (!vm.isAuthenticated) {
    redirect("/login");
  }

  const navLinks = [
    { label: t("nav.about"), href: "/" },
    { label: t("nav.awards"), href: "/award-system", selected: true },
    { label: t("nav.kudos"), href: "/kudos" },
  ];

  const user =
    vm.isAuthenticated && vm.user
      ? { name: vm.user.name, isAdmin: vm.isAdmin }
      : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink">
      <SiteHeader
        locale={locale as Locale}
        navLinks={navLinks}
        user={user}
        hasUnreadNotifications={vm.notifications.unreadCount > 0}
      />
      <main className="relative isolate flex-1 bg-ink mt-20">
        {/* Keyvisual backdrop — same source artwork as the homepage, but
            CONTAINED to the hero band only (Figma: header 80px + a 547px-tall
            full-bleed keyvisual, ending well before the award list starts).
            The gradient fades ink -> artwork -> back to ink so the wordmark
            and section title stay readable and the award cards below sit on
            plain `bg-ink`, never on the backdrop. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 aspect-1440/547"
        >
          <Image
            src="/images/home/keyvisual-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(0deg, #00101A -4.23%, rgba(0, 19, 32, 0) 52.79%)",
            }}
          />
        </div>

        <AwardHero />
        <div className="pt-8 sm:pt-10 lg:pt-30">
          <AwardDetailList />
        </div>
        <KudosSection />
      </main>
      <WidgetButton />
      <SiteFooter />
    </div>
  );
}
