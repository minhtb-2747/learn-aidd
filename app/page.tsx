import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/components/login/language-selector";
import { getEventDateTime } from "@/lib/event/config";
import { computeCountdown } from "@/lib/event/countdown";
import { getHeaderViewModel } from "@/lib/home/header-view-model";
import SiteHeader from "@/components/home/site-header";
import HeroSection from "@/components/home/hero-section";
import RootFurtherSection from "@/components/home/root-further-section";
import AwardsSection from "@/components/home/awards-section";
import KudosSection from "@/components/home/kudos-section";
import WidgetButton from "@/components/home/widget-button";
import SiteFooter from "@/components/home/site-footer";

/**
 * Homepage SAA (top). Public server component: resolves the active locale, the
 * auth-aware header view-model, and the countdown target from `EVENT_DATETIME`,
 * then feeds the presentational sections. Header controls appear only when a
 * Supabase session exists; the countdown ticks client-side (LiveCountdown).
 */
export default async function Home() {
  const [locale, vm, t] = await Promise.all([
    getLocale(),
    getHeaderViewModel(),
    getTranslations("HomePage"),
  ]);

  const target = getEventDateTime();
  const initial = computeCountdown(target, new Date());

  const navLinks = [
    { label: t("nav.about"), href: "#", selected: true },
    { label: t("nav.awards"), href: "#" },
    { label: t("nav.kudos"), href: "#" },
  ];

  const user =
    vm.isAuthenticated && vm.user
      ? { name: vm.user.name, isAdmin: vm.isAdmin }
      : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#00101A]">
      <SiteHeader
        locale={locale as Locale}
        navLinks={navLinks}
        user={user}
        hasUnreadNotifications={vm.notifications.unreadCount > 0}
      />
      <main className="relative isolate flex-1 bg-[#00101A]">
        {/* Keyvisual backdrop — the root artwork PNG at its native aspect ratio
            (1512×1392), pinned to the top and behind all content so the fixed
            header and the hero/Root-Further sections flow over it. Absolute so it
            never adds height / pushes sections down. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 aspect-1512/1392"
        >
          <Image
            src="/images/home/keyvisual-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div
            className="absolute inset-0 aspect-1512/1480"
            style={{
              background:
                "linear-gradient(12.34deg, #00101A 23.7%, rgba(0, 18, 29, 0.461538) 38.34%, rgba(0, 19, 32, 0) 48.92%)",
            }}
          />
        </div>

        <HeroSection
          targetIso={target ? target.toISOString() : null}
          initial={initial}
        />
        <RootFurtherSection />
        <AwardsSection />
        <KudosSection />
      </main>
      <WidgetButton />
      <SiteFooter />
    </div>
  );
}
