import type { ReactNode } from "react";

export interface KudosStatRowProps {
  value: number;
  label: string;
  /** Rendered right after the label text — e.g. the x2 campaign badge. */
  badge?: ReactNode;
}

/**
 * One counter row of the stats card, shared by `KudosSidebar` and
 * `ProfileStatsCard` so the identical 5-counter block cannot drift apart.
 *
 * `badge` sits beside the LABEL, not the number — the x2 marker annotates
 * "hearts received" as a concept, so it reads with the wording.
 */
export default function KudosStatRow({ value, label, badge }: KudosStatRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-1 text-xl leading-7 font-bold text-white">
        {label}
        {badge}
      </span>
      <span className="shrink-0 text-3xl leading-10 font-bold text-gold">
        {value}
      </span>
    </div>
  );
}
