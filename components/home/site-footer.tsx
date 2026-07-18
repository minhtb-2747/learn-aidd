import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils/cn.utils";

/**
 * Site footer: logo + nav links on the left, copyright notice on the right.
 * Labels come from the HomePage i18n namespace; hrefs are homepage-only stubs.
 * The selected item mirrors the header's active section ("About SAA 2025" on
 * the homepage) — same item, but the footer renders its own active style
 * (translucent-yellow box + glow, no underline) per Figma.
 */
export default async function SiteFooter() {
  const t = await getTranslations("HomePage");

  const links = [
    { label: t("nav.about"), href: "#", selected: true },
    { label: t("nav.awards"), href: "#" },
    { label: t("nav.kudos"), href: "#" },
    { label: t("nav.standards"), href: "#" },
  ];

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
        <nav className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "px-4 py-4 text-base leading-6 font-bold tracking-[0.15px] transition-colors duration-200",
                link.selected
                  ? "bg-gold/10 text-white [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_var(--color-gold-glow)]"
                  : "text-white hover:bg-white/10",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <p className="text-center text-base leading-6 font-bold text-white [font-family:var(--font-montserrat-alternates)]">
        {t("footer.copyright")}
      </p>
    </footer>
  );
}
