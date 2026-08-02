"use client";

import { useEffect, type JSX } from "react";
import { useTranslations } from "next-intl";
import { PenIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";
import HeroBadge from "./hero-badge";
import {
  RULES_PANEL_TITLE,
  RECEIVER_SECTION,
  HERO_TIERS,
  SENDER_SECTION,
  COLLECTIBLE_ICONS,
  NATIONAL_KUDOS_SECTION,
  RULES_PANEL_FOOTER,
  type HeroTier,
  type CollectibleIcon,
} from "@/lib/kudos/rules-content";

export interface KudosRulesPanelProps {
  open: boolean;
  onClose: () => void;
  onWriteKudos?: () => void;
}

/**
 * Kudos "Thể lệ" panel: a dark right-side drawer covering the Hero tiers, the
 * 6-icon Secret Box collection and "Kudos Quốc Dân". Controlled and purely
 * presentational; copy lives in `rules-content.ts`.
 *
 * The 6 collectible-icon thumbnails have no clean single-image export from the
 * design, so they render as styled gradient placeholders with their caption.
 */
export default function KudosRulesPanel({
  open,
  onClose,
  onWriteKudos,
}: KudosRulesPanelProps): JSX.Element | null {
  const t = useTranslations("Kudos.rulesPanel");

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label={t("closeOverlayAria")}
        className="absolute inset-0 cursor-pointer bg-black/60"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={RULES_PANEL_TITLE}
        className="relative flex h-full w-full flex-col bg-[#00070C] sm:max-w-[553px]"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 sm:px-10">
          <h2 className="mb-6 text-2xl leading-8 font-bold text-gold">
            {RULES_PANEL_TITLE}
          </h2>

          <div className="flex flex-col gap-10 pb-10">
            <ReceiverSection />
            <SenderSection />
            <NationalKudosSection />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-divider px-6 py-6 sm:px-10">
          <button
            type="button"
            aria-label={RULES_PANEL_FOOTER.closeLabel}
            onClick={onClose}
            className="flex cursor-pointer items-center justify-center gap-2 rounded border border-gold-line bg-gold/10 px-4 py-4 text-base leading-6 font-bold tracking-[0.5px] text-white transition-colors duration-150 hover:bg-gold/20"
          >
            <span aria-hidden="true">✕</span>
            {RULES_PANEL_FOOTER.closeLabel}
          </button>
          <button
            type="button"
            aria-label={RULES_PANEL_FOOTER.writeKudosLabel}
            onClick={() => onWriteKudos?.()}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded bg-gold px-4 py-4 text-base leading-6 font-bold tracking-[0.5px] text-ink transition-colors duration-150 hover:bg-gold-glow"
          >
            <PenIcon className="h-6 w-6 shrink-0" />
            {RULES_PANEL_FOOTER.writeKudosLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiverSection() {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg leading-7 font-bold text-gold">{RECEIVER_SECTION.title}</h3>
      <p className="text-base leading-6 font-bold text-white/90">{RECEIVER_SECTION.intro}</p>
      <div className="flex flex-col gap-4">
        {HERO_TIERS.map((tier) => (
          <HeroTierRow key={tier.id} tier={tier} />
        ))}
      </div>
    </section>
  );
}

function HeroTierRow({ tier }: { tier: HeroTier }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <HeroBadge badge={tier.badgeLabel} />
        <span className="text-base leading-6 font-bold text-white/90">{tier.rangeLabel}</span>
      </div>
      <p className="text-sm leading-5 font-bold text-white/70">{tier.description}</p>
    </div>
  );
}

function SenderSection() {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg leading-7 font-bold text-gold">{SENDER_SECTION.title}</h3>
      <p className="text-base leading-6 font-bold text-white/90">{SENDER_SECTION.intro}</p>
      <div className="grid grid-cols-3 gap-4">
        {COLLECTIBLE_ICONS.map((icon) => (
          <CollectibleIconTile key={icon.id} icon={icon} />
        ))}
      </div>
      <p className="text-base leading-6 font-bold text-white/90">{SENDER_SECTION.closing}</p>
    </section>
  );
}

function CollectibleIconTile({ icon }: { icon: CollectibleIcon }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        aria-hidden="true"
        className={cn(
          "h-16 w-16 rounded-full border-2 border-white",
          "bg-gradient-to-br from-gold/60 via-gold/20 to-ink",
        )}
      />
      <span className="text-center text-xs leading-4 font-bold tracking-[0.5px] text-white">
        {icon.caption}
      </span>
    </div>
  );
}

function NationalKudosSection() {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg leading-7 font-bold text-gold">{NATIONAL_KUDOS_SECTION.title}</h3>
      <p className="text-base leading-6 font-bold text-white/90">{NATIONAL_KUDOS_SECTION.body}</p>
    </section>
  );
}
