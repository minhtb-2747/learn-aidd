import Image from "next/image";
import KudosComposer from "./kudos-composer";
export interface KudosBannerProps {
  title: string;
  inputPlaceholder: string;
  searchPlaceholder: string;
}

/**
 * Hero banner (MoMorph A / A.1, spec items `A`/`A.1`): headline over the
 * keyvisual backdrop (rendered by the page), the KUDOS logo lockup, and two
 * action row (`KudosComposer`): the "Ô nhập/Ghi nhận" pill opens the
 * Write-Kudos dialog (which can hand off to the Rules panel); the Sunner
 * search pill stays a presentational stub in this build's scope.
 */
export default function KudosBanner({
  title,
  inputPlaceholder,
  searchPlaceholder,
}: KudosBannerProps) {
  return (
    <section className="flex flex-col gap-16 px-6 pt-26 pb-10 sm:px-9 lg:px-36">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-4xl leading-11 font-bold text-gold sm:text-[36px]">
          {title}
        </h1>
        <Image
          src="/images/home/kudos-logo-lockup.svg"
          alt="KUDOS"
          width={593}
          height={104}
          className="h-auto w-full max-w-148 max-h-26"
        />
      </div>

      <KudosComposer
        inputPlaceholder={inputPlaceholder}
        searchPlaceholder={searchPlaceholder}
      />
    </section>
  );
}
