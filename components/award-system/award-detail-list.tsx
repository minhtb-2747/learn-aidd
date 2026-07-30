import { getTranslations } from "next-intl/server";
import { AWARD_MEDIA } from "@/lib/home/award-media";
import AwardNav from "./award-nav";
import AwardDetailCard, { type AwardPrize } from "./award-detail-card";

/**
 * "Hệ thống giải thưởng SAA 2025" section: caption + divider + gold heading,
 * then a sticky left category nav beside the 6 award rows (2-col desktop,
 * nav collapses to a horizontal wrap above the list on mobile).
 */
export default async function AwardDetailList() {
  const t = await getTranslations("AwardSystem");

  const navItems = AWARD_MEDIA.map((media) => ({
    slug: media.slug,
    label: t(`awards.${media.msgKey}.navLabel`),
  }));

  return (
    <section className="bg-transparent px-6 sm:px-9 lg:px-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:gap-20">
        <header className="flex flex-col items-center gap-4 text-center">
          <p className="text-2xl leading-8 font-bold text-white">
            {t("caption")}
          </p>
          <div className="h-px w-full bg-divider" aria-hidden="true" />
          <h2 className="text-4xl leading-[64px] font-bold tracking-[-0.25px] text-gold sm:text-[57px]">
            {t("title")}
          </h2>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20 mt-10">
          <AwardNav items={navItems} navAriaLabel={t("navAriaLabel")} />

          <div className="flex min-w-0 flex-1 flex-col gap-16">
            {AWARD_MEDIA.map((media, index) => {
              const prizes = t.raw(
                `awards.${media.msgKey}.prizes`,
              ) as AwardPrize[];

              return (
                <AwardDetailCard
                  key={media.slug}
                  slug={media.slug}
                  nameImageSrc={media.nameImageSrc}
                  nameImageWidth={media.nameImageWidth}
                  nameImageHeight={media.nameImageHeight}
                  title={t(`awards.${media.msgKey}.title`)}
                  description={t(`awards.${media.msgKey}.description`)}
                  quantityLabel={t("quantityLabel")}
                  quantityValue={t(`awards.${media.msgKey}.quantityValue`)}
                  quantityUnit={t(`awards.${media.msgKey}.quantityUnit`)}
                  prizeValueLabel={t("prizeValueLabel")}
                  prizes={prizes}
                  orLabel={t("orLabel")}
                  imageOnRight={index % 2 === 1}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
