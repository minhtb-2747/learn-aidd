import Image from "next/image";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/components/login/language-selector";
import { getHeaderViewModel } from "@/lib/home/header-view-model";
import SiteHeader from "@/components/home/site-header";
import SiteFooter from "@/components/home/site-footer";
import WidgetButton from "@/components/home/widget-button";
import ProfileHeader from "@/components/profile/profile-header";
import IconCollection from "@/components/profile/icon-collection";
import ProfileStatsCard from "@/components/profile/profile-stats";
import ProfileKudosList from "@/components/profile/profile-kudos-list";
import {
  profilePerson,
  profileStats,
  collectionIcons,
  profileKudosPosts,
  sentFilterCount,
  receivedFilterCount,
} from "@/lib/profile/mock-data";

/**
 * `[id]` is a mock route param — every id renders the same demo profile,
 * there is no per-user backend yet. Next.js 16 passes route params as a
 * Promise (see the framework's own dynamic-route-segments doc), so it must
 * be awaited before use even though this page never reads `id` itself.
 */
interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * "Profile bản thân" (Sunner Profile) screen (MoMorph frame `362:5037`,
 * screenId `3FoIx6ALVb`): keyvisual banner with an overlapping avatar, name +
 * department + recognition badge, the icon-collection row, the stats card,
 * and the "Sun* Annual Awards 2025 / KUDOS" post list. Mock-data UI + light
 * client interactions only — mirrors `app/kudos/page.tsx`'s header/keyvisual
 * backdrop/footer wiring; the route itself is auth-gated in `proxy.ts`
 * (owned by the orchestrator).
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  await params;

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
            award-system/kudos screens (header 80px + full-bleed artwork
            fading back to `bg-ink`); the profile avatar overlaps its bottom
            edge, per the design's "Bìa" (cover) frame. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 aspect-1440/420"
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

        <div className="flex flex-col gap-8 pt-20 pb-8">
          <ProfileHeader person={profilePerson} />
          <IconCollection icons={collectionIcons} title="Bộ sưu tập icon của tôi" />
        </div>

        <div className="px-6">
          <ProfileStatsCard stats={profileStats} />
        </div>

        <ProfileKudosList
          posts={profileKudosPosts}
          sentCount={sentFilterCount}
          receivedCount={receivedFilterCount}
          likeAriaLabel={tk("card.likeAria")}
          unlikeAriaLabel={tk("card.unlikeAria")}
          copyLinkLabel={tk("card.copyLink")}
          toastMessage={tk("toast.linkCopied")}
        />
      </main>
      <WidgetButton />
      <SiteFooter />
    </div>
  );
}
