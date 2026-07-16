import { getTranslations } from "next-intl/server";
import { ArrowUpRightIcon } from "@/icons";

export interface CtaButtonsProps {
  aboutAwardsHref?: string;
  aboutKudosHref?: string;
}

/**
 * Hero call-to-action row: filled "ABOUT AWARDS" + outlined "ABOUT KUDOS".
 * Hrefs are stubs — clarifications.md scopes this build to homepage-only
 * (no sub-pages yet). Labels come from the HomePage i18n namespace.
 */
export default async function CtaButtons({
  aboutAwardsHref = "#",
  aboutKudosHref = "#",
}: CtaButtonsProps) {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-wrap items-start gap-10 mt-10">
      <a
        href={aboutAwardsHref}
        className="flex items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(255,234,158,0.35)]"
      >
        <span className="text-[22px] leading-7 font-bold text-[#00101A]">
          {t("cta.aboutAwards")}
        </span>
        <ArrowUpRightIcon className="h-6 w-6 shrink-0 text-[#00101A]" />
      </a>

      <a
        href={aboutKudosHref}
        className="flex items-center gap-2 rounded-lg border border-[#998C5F] bg-[#FFEA9E]/10 px-6 py-4 transition-colors duration-200 hover:bg-[#FFEA9E]/20"
      >
        <span className="text-[22px] leading-7 font-bold text-white">
          {t("cta.aboutKudos")}
        </span>
        <ArrowUpRightIcon className="h-6 w-6 shrink-0 text-white" />
      </a>
    </div>
  );
}
