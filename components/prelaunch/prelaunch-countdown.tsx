"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { computeCountdown, pad2, type Countdown } from "@/lib/event/countdown";
import CountdownDisplay from "@/components/home/countdown-display";

export interface PrelaunchCountdownProps {
  /** Event target as ISO-8601 (resolved server-side from EVENT_DATETIME). */
  targetIso: string | null;
  /** Server-computed initial value for a hydration-safe first paint. */
  initial: Countdown;
}

/** DAYS is capped at 99 to fit the two-digit LED tiles (clarifications.md). */
const MAX_DAYS = 99;

/**
 * Prelaunch countdown — reuses the presentational CountdownDisplay tiles but
 * ticks every second (spec: real-time update) and hides the built-in label
 * (the "Sự kiện sẽ bắt đầu sau" title is rendered by the page above it).
 */
export default function PrelaunchCountdown({
  targetIso,
  initial,
}: PrelaunchCountdownProps) {
  const t = useTranslations("HomePage");
  const [countdown, setCountdown] = useState<Countdown>(initial);

  useEffect(() => {
    const target = targetIso ? new Date(targetIso) : null;
    const tick = () => setCountdown(computeCountdown(target, new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <CountdownDisplay
      days={pad2(Math.min(countdown.days, MAX_DAYS))}
      hours={pad2(countdown.hours)}
      minutes={pad2(countdown.minutes)}
      daysLabel={t("countdown.days")}
      hoursLabel={t("countdown.hours")}
      minutesLabel={t("countdown.minutes")}
      showLabel={false}
    />
  );
}
