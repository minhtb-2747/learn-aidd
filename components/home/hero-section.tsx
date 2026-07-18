import type { Countdown } from "@/lib/event/countdown";
import LiveCountdown from "./live-countdown";
import EventInfo from "./event-info";
import CtaButtons from "./cta-buttons";

export interface HeroSectionProps {
  /** Event target as ISO-8601, or null when unconfigured/invalid. */
  targetIso: string | null;
  /** Server-computed initial countdown (hydration-safe first paint). */
  initial: Countdown;
}

/**
 * Hero content — "ROOT FURTHER" wordmark, countdown, event info and CTA row.
 * Transparent and sized to its own content; the keyvisual image + gradient live
 * on the <main> backdrop (app/page.tsx) so this section never forces extra
 * height onto the page. Top padding clears the fixed header. Countdown ticks
 * client-side from `EVENT_DATETIME`.
 */
export default function HeroSection({ targetIso, initial }: HeroSectionProps) {
  return (
    <section className="relative w-full">
      <div className="flex flex-col gap-10 px-6 pt-28 sm:px-9 lg:px-36 lg:pt-46">
        {/* eslint-disable-next-line @next/next/no-img-element -- static presentational wordmark */}
        <img
          src="/images/login/root-further-logo.png"
          alt="Root Further"
          width={451}
          height={200}
          className="h-auto w-full max-w-112.75"
        />

        <div className="flex flex-col">
          <LiveCountdown targetIso={targetIso} initial={initial} />
          <EventInfo />
          <CtaButtons />
        </div>
      </div>
    </section>
  );
}
