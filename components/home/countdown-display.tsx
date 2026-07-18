// Countdown digits use the Figma "Digital Numbers" face, bundled locally and
// exposed as --font-digital-numbers in app/layout.tsx (see public/fonts/).
export interface CountdownDisplayProps {
  /** Two-digit day count (e.g. "20"). Integration feeds live values in. */
  days?: string;
  hours?: string;
  minutes?: string;
  /** "Coming soon" label text. */
  label?: string;
  /** Translated unit labels (DAYS / HOURS / MINUTES). */
  daysLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
  /** Hide the label (integration sets this false once the event date has passed). */
  showLabel?: boolean;
}

function DigitTile({ digit }: { digit: string }) {
  return (
    <div className="flex h-20.5 w-12.75 items-center justify-center rounded-lg border-[0.5px] border-gold/50 bg-gradient-to-b from-white/50 to-white/5 backdrop-blur-md">
      <span className="text-[49px] leading-none font-normal tabular-nums text-white [font-family:var(--font-digital-numbers)]">
        {digit}
      </span>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  const digits = value.padStart(2, "0").slice(0, 2).split("");
  return (
    <div className="flex flex-col items-start gap-3.5">
      <div className="flex items-center gap-3.5">
        {digits.map((digit, index) => (
          <DigitTile key={index} digit={digit} />
        ))}
      </div>
      <span className="text-2xl leading-8 font-bold text-white">{label}</span>
    </div>
  );
}

/**
 * Static countdown tiles (DAYS / HOURS / MINUTES). Presentational only — no
 * ticking timer here; a client wrapper in phase 01/05 recomputes `days`/
 * `hours`/`minutes` from `EVENT_DATETIME` and re-renders this component.
 */
export default function CountdownDisplay({
  days = "20",
  hours = "20",
  minutes = "20",
  label = "Coming soon",
  daysLabel = "DAYS",
  hoursLabel = "HOURS",
  minutesLabel = "MINUTES",
  showLabel = true,
}: CountdownDisplayProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      {showLabel && (
        <p className="text-2xl leading-8 font-bold text-white">{label}</p>
      )}
      <div className="flex flex-wrap items-center gap-10">
        <CountdownUnit value={days} label={daysLabel} />
        <CountdownUnit value={hours} label={hoursLabel} />
        <CountdownUnit value={minutes} label={minutesLabel} />
      </div>
    </div>
  );
}
