import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getEventDateTime } from "@/lib/event/config";
import { computeCountdown } from "@/lib/event/countdown";
import PrelaunchCountdown from "@/components/prelaunch/prelaunch-countdown";

/**
 * Countdown / prelaunch holding page. Shown while the event has not started —
 * `proxy.ts` redirects every route here until `EVENT_DATETIME` passes. Once the
 * event has started (or no target is configured) the gate is open, so this page
 * sends the visitor home rather than showing a dead 00:00:00 countdown.
 */
export default async function PrelaunchPage() {
  const target = getEventDateTime();
  const now = new Date();
  if (!target || now >= target) redirect("/");

  const initial = computeCountdown(target, now);
  const t = await getTranslations("Prelaunch");

  return (
    <div className="relative isolate w-full overflow-hidden bg-ink aspect-1512/1077">
      <Image
        src="/images/home/keyvisual-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(18.34deg, var(--color-ink) 15.48%, rgba(0, 18, 29, 0.461538) 52.13%, rgba(0, 19, 32, 0) 63.41%)",
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="text-2xl leading-8 font-bold text-white">{t("title")}</p>
        <PrelaunchCountdown
          targetIso={target.toISOString()}
          initial={initial}
        />
      </div>
    </div>
  );
}
