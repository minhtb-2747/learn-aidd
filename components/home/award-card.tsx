import Image from "next/image";
import { ArrowUpRightIcon } from "@/icons";

export interface AwardCardData {
  slug: string;
  /** Stylized award-name image extracted from the Figma design. */
  nameImageSrc: string;
  nameImageWidth: number;
  nameImageHeight: number;
  title: string;
  description: string;
  /** Translated "Chi tiết" / "Details" link label. */
  detailLabel?: string;
}

/**
 * One card in the "Hệ thống giải thưởng" grid: glowing orb thumbnail with a
 * stylized name badge layered on top, plain-text title/description, and a
 * "Chi tiết" detail link. `href` is a stub (`/awards#<slug>`) for
 * integration to point at the real award detail route.
 */
export default function AwardCard({
  slug,
  nameImageSrc,
  nameImageWidth,
  nameImageHeight,
  title,
  description,
  detailLabel = "Chi tiết",
}: AwardCardData) {
  return (
    <article className="flex w-full max-w-84 flex-col items-start gap-6 transition-transform duration-200 hover:-translate-y-1">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border-[0.955px] border-gold shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_var(--color-gold-glow)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.35),0_0_16px_var(--color-gold-glow)]">
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
          className="relative z-10 max-w-[70%]"
        />
      </div>

      <div className="flex flex-col items-start gap-1">
        <h3 className="text-2xl leading-8 text-gold">{title}</h3>
        <p className="text-base leading-6 tracking-[0.5px] text-white">
          {description}
        </p>
        <a
          href={`/awards#${slug}`}
          className="mt-2 flex items-center gap-1 py-4 text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-200 hover:text-gold"
        >
          {detailLabel}
          <ArrowUpRightIcon className="h-6 w-6 shrink-0" />
        </a>
      </div>
    </article>
  );
}
