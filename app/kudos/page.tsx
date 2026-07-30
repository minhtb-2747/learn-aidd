import Image from "next/image";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/components/login/language-selector";
import { getHeaderViewModel } from "@/lib/home/header-view-model";
import SiteHeader from "@/components/home/site-header";
import SiteFooter from "@/components/home/site-footer";
import WidgetButton from "@/components/home/widget-button";
import KudosBanner from "@/components/kudos/kudos-banner";
import HighlightCarousel from "@/components/kudos/highlight-carousel";
import SpotlightBoard from "@/components/kudos/spotlight-board";
import AllKudosFeed from "@/components/kudos/all-kudos-feed";
import KudosSidebar from "@/components/kudos/kudos-sidebar";

/**
 * "Sun* Kudos - Live board" screen (MoMorph frame `2940:13431`): the hero
 * banner, HIGHLIGHT KUDOS carousel, SPOTLIGHT BOARD word-cloud, and the
 * two-column ALL KUDOS feed + sidebar. Mock-data UI + light client
 * interactions only — mirrors `app/award-system/page.tsx`'s header/keyvisual
 * backdrop/footer wiring; the route itself is auth-gated in `proxy.ts`
 * (owned by the orchestrator).
 */
export default async function KudosPage() {
  const [locale, vm, t] = await Promise.all([
    getLocale(),
    getHeaderViewModel(),
    getTranslations("HomePage"),
  ]);
  const tk = await getTranslations("Kudos");

  // Defense-in-depth: the route is already guarded in proxy.ts, but re-verify
  // the Supabase session server-side (the view-model is backed by getUser())
  // so a proxy misconfiguration can never expose this page — mirrors /todo.
  if (!vm.isAuthenticated) {
    redirect("/login");
  }

  const navLinks = [
    { label: t("nav.about"), href: "/" },
    { label: t("nav.awards"), href: "/award-system" },
    { label: t("nav.kudos"), href: "/kudos", selected: true },
  ];

  const user =
    vm.isAuthenticated && vm.user
      ? { name: vm.user.name, isAdmin: vm.isAdmin }
      : null;

  const cardCopy = {
    viewDetailLabel: tk("highlight.viewDetail"),
    likeAriaLabel: tk("card.likeAria"),
    unlikeAriaLabel: tk("card.unlikeAria"),
    copyLinkLabel: tk("card.copyLink"),
    toastMessage: tk("toast.linkCopied"),
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink">
      <SiteHeader
        locale={locale as Locale}
        navLinks={navLinks}
        user={user}
        hasUnreadNotifications={vm.notifications.unreadCount > 0}
      />
      <main className="relative isolate flex-1 bg-ink pt-20">
        {/* Keyvisual backdrop — same contained hero-band treatment as the
            award-system screen (header 80px + full-bleed artwork fading back
            to `bg-ink` before the banner content starts). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 aspect-1440/520"
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

        <KudosBanner
          title={tk("banner.title")}
          inputPlaceholder={tk("banner.inputPlaceholder")}
          searchPlaceholder={tk("banner.searchPlaceholder")}
        />

        <HighlightCarousel
          subtitle={tk("highlight.subtitle")}
          title={tk("highlight.title")}
          hashtagLabel={tk("highlight.hashtagLabel")}
          departmentLabel={tk("highlight.departmentLabel")}
          prevAriaLabel={tk("highlight.prevAria")}
          nextAriaLabel={tk("highlight.nextAria")}
          {...cardCopy}
        />

        <section className="flex flex-col gap-16 px-6 pt-22 pb-16 sm:px-9 lg:px-36">
          <div className="flex flex-col gap-4">
            <p className="text-2xl leading-8 font-bold text-white">
              {tk("spotlight.subtitle")}
            </p>
            <div className="h-px w-full bg-divider" aria-hidden="true" />
            <h2 className="text-4xl leading-16 font-bold tracking-[-0.25px] text-gold sm:text-[57px]">
              {tk("spotlight.title")}
            </h2>
          </div>
          <SpotlightBoard
            totalLabel={tk("spotlight.total")}
            searchPlaceholder={tk("spotlight.searchPlaceholder")}
          />
        </section>

        <section className="flex flex-col gap-10 px-6 pt-14 pb-20 sm:px-9 lg:px-36">
          <div className="flex flex-col gap-4">
            <p className="text-2xl leading-8 font-bold text-white">
              {tk("allKudos.subtitle")}
            </p>
            <div className="h-px w-full bg-divider" aria-hidden="true" />
            <h2 className="text-4xl leading-[64px] font-bold tracking-[-0.25px] text-gold sm:text-[57px]">
              {tk("allKudos.title")}
            </h2>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <AllKudosFeed {...cardCopy} />
            <KudosSidebar
              receivedLabel={tk("sidebar.received")}
              sentLabel={tk("sidebar.sent")}
              heartsLabel={tk("sidebar.hearts")}
              boxesOpenedLabel={tk("sidebar.boxesOpened")}
              boxesUnopenedLabel={tk("sidebar.boxesUnopened")}
              openGiftLabel={tk("sidebar.openGift")}
              giftBoardTitle={tk("sidebar.giftBoardTitle")}
            />
          </div>
        </section>
      </main>
      <WidgetButton />
      <SiteFooter />
    </div>
  );
}
