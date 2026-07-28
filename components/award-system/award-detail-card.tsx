import Image from "next/image";
import { DiamondIcon, LicenseIcon, TargetIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";

export interface AwardPrize {
  value: string;
  /** Small qualifier under the prize value, e.g. "cho mỗi giải thưởng". */
  suffix?: string;
}

export interface AwardDetailCardProps {
  slug: string;
  nameImageSrc: string;
  nameImageWidth: number;
  nameImageHeight: number;
  title: string;
  description: string;
  quantityLabel: string;
  quantityValue: string;
  quantityUnit: string;
  prizeValueLabel: string;
  prizes: AwardPrize[];
  /** "Hoặc" divider label shown between prize blocks (Signature has two). */
  orLabel: string;
  /** Image renders on the right instead of the left (even rows, per design). */
  imageOnRight?: boolean;
}

/**
 * One row in the "Hệ thống giải thưởng SAA 2025" list: a glowing orb thumbnail
 * plus title / description / quantity / prize-value content. Image side
 * alternates per `imageOnRight` — odd rows (1st, 3rd, 5th) show the image on
 * the left, even rows on the right, matching the Figma design.
 */
export default function AwardDetailCard({
  slug,
  nameImageSrc,
  nameImageWidth,
  nameImageHeight,
  title,
  description,
  quantityLabel,
  quantityValue,
  quantityUnit,
  prizeValueLabel,
  prizes,
  orLabel,
  imageOnRight = false,
}: AwardDetailCardProps) {
  return (
    <article
      id={`award-${slug}`}
      className={cn(
        "flex scroll-mt-28 flex-col gap-10 border-b border-divider pb-16 last:border-b-0 last:pb-0 lg:flex-row lg:items-start",
        imageOnRight && "lg:flex-row-reverse",
      )}
    >
      <div className="relative mx-auto aspect-square w-full max-w-84 shrink-0 overflow-hidden rounded-3xl border-[0.955px] border-gold shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_var(--color-gold-glow)]">
        <Image
          src="/images/home/award-bg.png"
          alt=""
          fill
          sizes="336px"
          className="object-cover mix-blend-screen"
        />
        <Image
          src={nameImageSrc}
          alt={title}
          width={nameImageWidth}
          height={nameImageHeight}
          style={{ width: "auto", height: "auto" }}
          className="absolute top-1/2 left-1/2 z-10 max-w-[70%] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <TargetIcon className="h-6 w-6 shrink-0 text-gold" />
            <h3 className="text-2xl leading-8 font-bold text-gold">{title}</h3>
          </div>
          <p className="text-justify text-base leading-6 font-bold tracking-[0.5px] text-white">
            {description}
          </p>
        </div>

        <div className="h-px w-full bg-divider" aria-hidden="true" />

        <div className="flex flex-wrap items-center gap-4">
          <DiamondIcon className="h-6 w-6 shrink-0 text-gold" />
          <span className="text-2xl leading-8 font-bold text-gold">
            {quantityLabel}
          </span>
          <span className="text-4xl leading-[44px] font-bold text-white">
            {quantityValue}
          </span>
          <span className="text-sm leading-5 font-bold tracking-[0.1px] text-white">
            {quantityUnit}
          </span>
        </div>

        <div className="h-px w-full bg-divider" aria-hidden="true" />

        <div className="flex flex-col gap-6">
          {prizes.map((prize, index) => (
            <div key={`${slug}-prize-${index}`} className="flex flex-col gap-4">
              {index > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm leading-5 font-bold tracking-[0.1px] text-divider">
                    {orLabel}
                  </span>
                  <div className="h-px flex-1 bg-divider" aria-hidden="true" />
                </div>
              )}
              <div className="flex items-center gap-4">
                <LicenseIcon className="h-6 w-6 shrink-0 text-gold" />
                <span className="text-2xl leading-8 font-bold text-gold">
                  {prizeValueLabel}
                </span>
              </div>
              <span className="text-4xl leading-[44px] font-bold text-white">
                {prize.value}
              </span>
              {prize.suffix && (
                <span className="text-sm leading-5 font-bold tracking-[0.1px] text-white">
                  {prize.suffix}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
