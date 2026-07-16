import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRightIcon } from "@/icons";

export interface KudosSectionProps {
  detailHref?: string;
}

/**
 * "Sun* Kudos" promo block: dark background image, label + title + badge +
 * body copy, a "Chi tiết" CTA, and the KUDOS lockup image on the right.
 * Copy is i18n-driven; `href` is a stub (homepage-only scope).
 */
export default async function KudosSection({
  detailHref = "#",
}: KudosSectionProps) {
  const t = await getTranslations("HomePage");

  return (
    <section className="bg-transparent px-6 py-30 sm:px-9 lg:px-36">
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-10 overflow-hidden rounded-2xl bg-[#0F0F0F] px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-20">
        <Image
          src="/images/home/kudos-bg.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 1120px, 100vw"
          className="object-cover"
        />

        <div className="relative z-10 flex max-w-114 flex-col items-start gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-2xl leading-8 font-bold text-white">
              {t("kudos.label")}
            </p>
            <h2 className="text-4xl leading-[64px] font-bold tracking-[-0.25px] text-[#FFEA9E] sm:text-[57px]">
              {t("kudos.title")}
            </h2>
            <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#FFEA9E]">
              {t("kudos.badge")}
            </p>
            <p className="text-justify text-base leading-6 font-bold tracking-[0.5px] text-white">
              {t("kudos.body")}
            </p>
          </div>

          <a
            href={detailHref}
            className="flex items-center gap-2 rounded bg-[#FFEA9E] px-4 py-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(255,234,158,0.35)]"
          >
            {t("kudos.detail")}
            <ArrowUpRightIcon className="h-6 w-6 shrink-0" />
          </a>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- static presentational lockup image */}
        <img
          src="/images/home/kudos-logo-lockup.svg"
          alt="Sun* Kudos"
          width={364}
          height={72}
          className="relative z-10 h-auto w-full max-w-91 shrink-0"
        />
      </div>
    </section>
  );
}
