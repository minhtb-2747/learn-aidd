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
import { getBoardData } from "./board-data";

interface KudosPageProps {
  /** URL-driven carousel filters. Next.js 16 passes `searchParams` as a Promise. */
  searchParams: Promise<{ hashtag?: string; department?: string }>;
}

/**
 * "Sun* Kudos - Live board": hero banner, highlight carousel, spotlight
 * word-cloud, and the two-column feed + sidebar. Server-rendered via
 * `getBoardData` — every child receives plain serializable props and none
 * imports a query module. The route is auth-gated in `proxy.ts`.
 */
export default async function KudosPage({ searchParams }: KudosPageProps) {
  const [locale, vm, t, params] = await Promise.all([
    getLocale(),
    getHeaderViewModel(),
    getTranslations("HomePage"),
    searchParams,
  ]);
  const tk = await getTranslations("Kudos");

  // Defense-in-depth: proxy.ts already guards this route, but re-verifying the
  // session here means a proxy misconfiguration can never expose the page.
  if (!vm.isAuthenticated) {
    redirect("/login");
  }

  const data = await getBoardData({
    hashtag: params.hashtag,
    department: params.department,
  });

  const navLinks = [
    { label: t("nav.about"), href: "/" },
    { label: t("nav.awards"), href: "/award-system" },
    { label: t("nav.kudos"), href: "/kudos", selected: true },
  ];

  const user =
    vm.isAuthenticated && vm.user
      ? {
          name: vm.user.name,
          isAdmin: vm.isAdmin,
          profileHref: `/profile/${vm.user.id}`,
        }
      : null;

  // Drives the heart button's optimistic delta (see kudos-heart-button.tsx).
  const heartMultiplier = data.campaign?.heartMultiplier ?? 1;

  const cardCopy = {
    heartMultiplier,
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
        {/* Keyvisual backdrop — the contained hero band, fading back to
            `bg-ink` before the banner content starts. */}
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
          // Remounting on filter change resets the slide index for free.
          key={`${params.hashtag ?? ""}::${params.department ?? ""}`}
          subtitle={tk("highlight.subtitle")}
          title={tk("highlight.title")}
          hashtagLabel={tk("highlight.hashtagLabel")}
          departmentLabel={tk("highlight.departmentLabel")}
          prevAriaLabel={tk("highlight.prevAria")}
          nextAriaLabel={tk("highlight.nextAria")}
          emptyLabel={tk("highlight.empty")}
          kudos={data.highlightKudos}
          hashtagOptions={data.hashtagOptions}
          departmentOptions={data.departmentOptions}
          activeHashtag={params.hashtag}
          activeDepartment={params.department}
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
            names={data.spotlightNames}
            ticker={data.spotlightTicker}
            totalLabel={tk("spotlight.total", { count: data.totalKudos })}
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
            <AllKudosFeed
              posts={data.allKudosPosts}
              {...cardCopy}
              editAriaLabel={tk("card.editAria")}
            />
            <KudosSidebar
              receivedLabel={tk("sidebar.received")}
              sentLabel={tk("sidebar.sent")}
              heartsLabel={tk("sidebar.hearts")}
              boxesOpenedLabel={tk("sidebar.boxesOpened")}
              boxesUnopenedLabel={tk("sidebar.boxesUnopened")}
              openGiftLabel={tk("sidebar.openGift")}
              giftBoardTitle={tk("sidebar.giftBoardTitle")}
              stats={data.stats}
              giftRecipients={data.giftRecipients}
              campaign={data.campaign}
            />
          </div>
        </section>
      </main>
      <WidgetButton />
      <SiteFooter />
    </div>
  );
}
