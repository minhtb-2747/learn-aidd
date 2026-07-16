"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { computeCountdown, pad2, type Countdown } from "@/lib/event/countdown";
import CountdownDisplay from "./countdown-display";

export interface LiveCountdownProps {
  /** Event target as an ISO-8601 string, or null when unconfigured/invalid. */
  targetIso: string | null;
  /** Server-computed initial value — used for the first paint so SSR and the
   *  first client render agree (no hydration mismatch); the interval takes
   *  over afterwards. */
  initial: Countdown;
}

/**
 * Client wrapper that re-derives the countdown from `EVENT_DATETIME` every
 * minute and feeds the presentational CountdownDisplay. Labels come from the
 * HomePage i18n namespace so they follow the active locale.
 */
export default function LiveCountdown({
  targetIso,
  initial,
}: LiveCountdownProps) {
  const t = useTranslations("HomePage");
  const [countdown, setCountdown] = useState<Countdown>(initial);

  useEffect(() => {
    const target = targetIso ? new Date(targetIso) : null;
    const tick = () => setCountdown(computeCountdown(target, new Date()));
    tick(); // refresh immediately after mount, then every minute
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <CountdownDisplay
      days={pad2(countdown.days)}
      hours={pad2(countdown.hours)}
      minutes={pad2(countdown.minutes)}
      label={t("hero.comingSoon")}
      daysLabel={t("countdown.days")}
      hoursLabel={t("countdown.hours")}
      minutesLabel={t("countdown.minutes")}
      showLabel={countdown.isBeforeEvent}
    />
  );
}
