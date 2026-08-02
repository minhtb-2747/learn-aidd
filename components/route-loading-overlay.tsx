"use client";

import { useTranslations } from "next-intl";

export interface RouteLoadingOverlayProps {
  /** Usually a `useTransition` pending flag around a `router.replace`. */
  active: boolean;
}

/**
 * Full-screen blocking overlay for a filter change that re-runs the page's
 * server queries. Rendered by the Kudos and Profile filter lists.
 *
 * These filters navigate (`router.replace` with new `searchParams`), so the
 * whole page re-renders and every visible number is stale until it lands.
 * Without a block, a second filter click starts a second navigation racing the
 * first, and the slower one wins.
 *
 * Blocking is immediate but the fade is DELAYED (keyframe in `globals.css`): a
 * fast response would otherwise flash a grey sheet over the page. Nothing is
 * clickable during the delay either — only the paint waits.
 *
 * Pointer events alone would still leave the filter reachable by keyboard, so
 * the callers also pass `disabled` to their trigger, taking it out of the tab
 * order. `z-60` clears the header (40) and the modals (50).
 */
export default function RouteLoadingOverlay({ active }: RouteLoadingOverlayProps) {
  const t = useTranslations("Common");

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-60 flex animate-[overlay-fade_150ms_ease-out_180ms_both] items-center justify-center bg-ink/70 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold"
          aria-hidden="true"
        />
        <span className="text-base leading-6 font-bold text-white">
          {t("loading")}
        </span>
      </div>
    </div>
  );
}
