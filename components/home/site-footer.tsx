"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";
import { useKudosModals } from "@/components/kudos/kudos-modals-provider";

/** True when `pathname` is the given route (exact for "/", prefix otherwise). */
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Site footer: logo + nav on the left, copyright on the right.
 *
 * A client component so it derives its active item from `usePathname()` — no
 * page has to remember to pass an active flag down, and it stays correct for
 * routes added later.
 *
 * "Thể lệ" is not a route; it opens the shared Rules panel, so it is a button
 * rather than a dead link. The active style is deliberately the footer's own
 * (box + glow), not the header's underline.
 */
export default function SiteFooter() {
  const t = useTranslations("HomePage");
  const pathname = usePathname();
  const { openRules } = useKudosModals();

  const links = [
    { label: t("nav.about"), href: "/" },
    { label: t("nav.awards"), href: "/award-system" },
    { label: t("nav.kudos"), href: "/kudos" },
  ];

  const itemClass =
    "px-4 py-4 text-base leading-6 font-bold tracking-[0.15px] transition-colors duration-200";
  const activeClass =
    "bg-gold/10 text-white [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_var(--color-gold-glow)]";
  const idleClass = "text-white hover:bg-white/10";

  return (
    <footer className="flex flex-col items-center gap-6 border-t border-divider bg-ink px-6 py-10 sm:px-9 lg:flex-row lg:justify-between lg:px-22.5">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-20">
        {/* eslint-disable-next-line @next/next/no-img-element -- static presentational brand asset */}
        <img
          src="/images/login/logo.png"
          alt="Sun* Annual Awards 2025"
          width={69}
          height={64}
          className="h-16 w-17.25 shrink-0"
        />
        {/* Items carry `px-4`, so the visual gap is this plus 32px. */}
        <nav className="flex flex-wrap items-center justify-center gap-2 lg:gap-6">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(itemClass, active ? activeClass : idleClass)}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={openRules}
            className={cn(itemClass, idleClass, "cursor-pointer")}
          >
            {t("nav.standards")}
          </button>
        </nav>
      </div>

      <p className="text-center text-base leading-6 font-bold text-white [font-family:var(--font-montserrat-alternates)]">
        {t("footer.copyright")}
      </p>
    </footer>
  );
}
