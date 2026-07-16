import LanguageSelector, {
  type Locale,
} from "@/components/login/language-selector";
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
 */
export default function SiteHeader({
  locale,
  navLinks,
  user = null,
  notifications = [],
  hasUnreadNotifications = false,
}: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-20 w-full items-center justify-between bg-[rgba(16,20,23,0.8)] px-6 sm:px-9 lg:px-36">
      <div className="flex items-center gap-8 lg:gap-16">
        {/* eslint-disable-next-line @next/next/no-img-element -- static presentational brand asset */}
        <img
          src="/images/login/logo.png"
          alt="Sun* Annual Awards 2025"
          width={52}
          height={48}
          className="h-12 w-[52px] shrink-0"
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
    </header>
  );
}
