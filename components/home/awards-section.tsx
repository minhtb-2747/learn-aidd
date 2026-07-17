import { getTranslations } from "next-intl/server";
import AwardCard from "./award-card";

/**
 * Per-card visual metadata extracted from the Figma design. Title/description
 * are NOT here — they come from the HomePage i18n namespace, keyed by `msgKey`.
 */
const AWARD_MEDIA = [
  {
    slug: "top-talent",
    msgKey: "topTalent",
    nameImageSrc: "/images/home/award-name-top-talent.png",
    nameImageWidth: 221,
    nameImageHeight: 35,
  },
  {
    slug: "top-project",
    msgKey: "topProject",
    nameImageSrc: "/images/home/award-name-top-project.png",
    nameImageWidth: 232,
    nameImageHeight: 35,
  },
  {
    slug: "top-project-leader",
    msgKey: "topProjectLeader",
    nameImageSrc: "/images/home/award-name-top-project-leader.png",
    nameImageWidth: 232,
    nameImageHeight: 64,
  },
  {
    slug: "best-manager",
    msgKey: "bestManager",
    nameImageSrc: "/images/home/award-name-best-manager.png",
    nameImageWidth: 232,
    nameImageHeight: 30,
  },
  {
    slug: "signature-2025-creator",
    msgKey: "signatureCreator",
    nameImageSrc: "/images/home/award-name-signature-creator.png",
    nameImageWidth: 232,
    nameImageHeight: 54,
  },
  {
    slug: "mvp",
    msgKey: "mvp",
    nameImageSrc: "/images/home/award-name-mvp.png",
    nameImageWidth: 116,
    nameImageHeight: 52,
  },
] as const;

/**
 * "Hệ thống giải thưởng" grid: caption + divider + title, then the 6 award
 * cards (3 cols desktop / 2 cols tablet / 1 col mobile). Copy is i18n-driven.
 */
export default async function AwardsSection() {
  const t = await getTranslations("HomePage");
  const detailLabel = t("awards.detail");

  return (
    <section className="bg-transparent px-6 sm:px-9 lg:px-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:gap-20">
        <header className="flex flex-col gap-4">
          <p className="text-2xl leading-8 font-bold text-white">
            {t("awards.caption")}
          </p>
          <div className="h-px w-full bg-divider" aria-hidden="true" />
          <h2 className="text-4xl leading-[64px] font-bold tracking-[-0.25px] text-gold sm:text-[57px]">
            {t("awards.title")}
          </h2>
          <p className="text-base leading-6 font-bold tracking-[0.15px] text-white">
            {t("awards.subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 place-items-center gap-x-20 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:place-items-stretch">
          {AWARD_MEDIA.map((media) => (
            <AwardCard
              key={media.slug}
              slug={media.slug}
              nameImageSrc={media.nameImageSrc}
              nameImageWidth={media.nameImageWidth}
              nameImageHeight={media.nameImageHeight}
              title={t(`awardItems.${media.msgKey}.title`)}
              description={t(`awardItems.${media.msgKey}.description`)}
              detailLabel={detailLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
