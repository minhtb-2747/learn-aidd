import LanguageSelector, {
  type Locale,
} from "@/components/login/language-selector";
import HeaderShell from "./header-shell";
import HeaderNav, { type HeaderNavLink } from "./header-nav";
import NotificationBell, { type NotificationItem } from "./notification-bell";
import AccountMenu, { type AccountMenuUser } from "./account-menu";

export interface SiteHeaderProps {
  /** Active locale, forwarded to the shared LanguageSelector. */
  locale?: Locale;
  /** Nav links; defaults to the three homepage sections. */
  navLinks?: HeaderNavLink[];
  /** `null`/`undefined` renders the logged-out (sign-in) affordance. */
  user?: AccountMenuUser | null;
  /** Mock notification list for the bell dropdown. */
  notifications?: NotificationItem[];
  hasUnreadNotifications?: boolean;
}

/**
 * Sticky homepage header: logo, section nav, language switcher, notification
 * bell, and account control. Auth/notification data is passed in as props —
 * this component only renders the two states (signed in / signed out).
 * `HeaderShell` owns the scroll-reactive background, so this stays server-side.
 */
export default function SiteHeader({
  locale,
  navLinks,
  user = null,
  notifications = [],
  hasUnreadNotifications = false,
}: SiteHeaderProps) {
  return (
    <HeaderShell>
      <div className="flex items-center gap-8 lg:gap-16">
        {/* eslint-disable-next-line @next/next/no-img-element -- static presentational brand asset */}
        <img
          src="/images/login/logo.png"
          alt="Sun* Annual Awards 2025"
          width={52}
          height={48}
          className="h-12 w-13 shrink-0"
        />
        <HeaderNav links={navLinks} />
      </div>

      <div className="flex items-center gap-4">
        <LanguageSelector current={locale} />
        <NotificationBell
          items={notifications}
          hasUnread={hasUnreadNotifications}
        />
        <AccountMenu user={user} />
      </div>
    </HeaderShell>
  );
}
