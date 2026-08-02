import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/components/login/language-selector";
import { getHeaderViewModel } from "@/lib/home/header-view-model";
import SiteHeader from "@/components/home/site-header";
import SiteFooter from "@/components/home/site-footer";
import WidgetButton from "@/components/home/widget-button";
import ProfileHeader from "@/components/profile/profile-header";
import IconCollection from "@/components/profile/icon-collection";
import ProfileStatsCard from "@/components/profile/profile-stats";
import ProfileWriteKudosCta from "@/components/profile/profile-write-kudos-cta";
import ProfileKudosList from "@/components/profile/profile-kudos-list";
import type { SentFilterValue } from "@/components/profile/sent-filter";
import { getProfileData } from "./profile-data";

/**
 * `[id]` is the viewed profile's uuid; `?filter=` picks the Đã gửi/Đã nhận
 * post list. Next.js 16 passes both route params and `searchParams` as
 * Promises (see the framework's own dynamic-route-segments doc).
 */
interface ProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}

/** Whitelists the raw `?filter=` string — anything else falls back to "sent". */
function normalizeFilter(value: string | undefined): SentFilterValue {
  return value === "received" ? "received" : "sent";
}

/**
 * Sunner Profile screen (screenId `3FoIx6ALVb`): keyvisual banner with an
 * overlapping avatar, identity + badge, icon collection, stats card and the
 * kudos post list. A malformed or missing `id` renders `notFound()`. The route
 * itself is auth-gated in `proxy.ts`.
 */
export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const [{ id }, rawSearchParams, locale, vm, t] = await Promise.all([
    params,
    searchParams,
    getLocale(),
    getHeaderViewModel(),
    getTranslations("HomePage"),
  ]);
  const tk = await getTranslations("Kudos");
  const tp = await getTranslations("Profile");

  // Defense-in-depth: proxy.ts already guards this route, but re-verifying the
  // session here means a proxy misconfiguration can never expose the page.
  if (!vm.isAuthenticated) {
    redirect("/login");
  }

  // Pinned to "received" server-side on anyone else's profile, not merely
  // hidden in the UI: `getProfileKudos(id, "sent")` applies no `status` filter
  // (owners see their own drafts and spam-flagged posts), so honouring
  // `?filter=sent` on a stranger would hand those to anyone editing the URL.
  const isOwnProfile = vm.user?.id === id;
  const filter = isOwnProfile
    ? normalizeFilter(rawSearchParams.filter)
    : "received";
  const data = await getProfileData(id, filter);
  if (!data) {
    notFound();
  }

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink">
      <SiteHeader
        locale={locale as Locale}
        navLinks={navLinks}
        user={user}
        hasUnreadNotifications={vm.notifications.unreadCount > 0}
      />
      <main className="relative isolate flex-1 bg-ink pt-20">
        {/* Keyvisual backdrop — the contained hero band used by the
            award-system/kudos screens; the avatar overlaps its bottom edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 aspect-1440/512"
        >
          <Image
            src="/images/home/profile_visual.svg"
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
                "linear-gradient(0deg, #00101A 25%, rgba(0, 19, 32, 0) 50%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(14.89deg, #00101A 20.2%, rgba(0, 19, 32, 0)",
            }}
          />
        </div>

        <div className="flex flex-col gap-8 pt-20 pb-8">
          <ProfileHeader person={data.person} />
          <IconCollection
            icons={data.icons}
            title={tp("iconCollectionTitle")}
          />
        </div>

        {/* Own profile gets the stats card; anyone else's gets the CTA — their
            gift counters and unopened boxes are not the viewer's business. */}
        <div className="px-6">
          {isOwnProfile ? (
            <ProfileStatsCard
              stats={data.stats}
              campaign={data.campaign}
              receivedLabel={tk("sidebar.received")}
              sentLabel={tk("sidebar.sent")}
              heartsLabel={tk("sidebar.hearts")}
              boxesOpenedLabel={tk("sidebar.boxesOpened")}
              boxesUnopenedLabel={tk("sidebar.boxesUnopened")}
              openGiftLabel={tk("sidebar.openGift")}
            />
          ) : (
            <ProfileWriteKudosCta
              recipientId={id}
              recipientName={data.person.name}
              label={tp("writeKudosCta", { name: data.person.name })}
            />
          )}
        </div>

        <ProfileKudosList
          posts={data.posts}
          filter={filter}
          sentCount={data.counts.sent}
          receivedCount={data.counts.received}
          heartMultiplier={data.campaign?.heartMultiplier ?? 1}
          likeAriaLabel={tk("card.likeAria")}
          unlikeAriaLabel={tk("card.unlikeAria")}
          copyLinkLabel={tk("card.copyLink")}
          toastMessage={tk("toast.linkCopied")}
          editAriaLabel={tk("card.editAria")}
          spamLabel={tk("card.spamBadge")}
          sectionSubtitle={tp("kudosSection.subtitle")}
          sectionTitle={tp("kudosSection.title")}
          sentLabel={tp("kudosSection.sentLabel")}
          receivedLabel={tp("kudosSection.receivedLabel")}
          emptyLabel={tp("kudosSection.empty")}
          isOwnProfile={isOwnProfile}
          receivedCountLabel={tp("kudosSection.receivedCount", {
            count: data.counts.received,
          })}
        />
      </main>
      <WidgetButton />
      <SiteFooter />
    </div>
  );
}
