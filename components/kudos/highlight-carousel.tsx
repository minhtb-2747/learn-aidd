"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import {
  highlightKudos,
  hashtagFilterOptions,
  departmentFilterOptions,
} from "@/lib/kudos/mock-data";
import KudosCard from "./kudos-card";

export interface HighlightCarouselProps {
  subtitle: string;
  title: string;
  hashtagLabel: string;
  departmentLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  viewDetailLabel: string;
  likeAriaLabel: string;
  unlikeAriaLabel: string;
  copyLinkLabel: string;
  toastMessage: string;
}

/**
 * "HIGHLIGHT KUDOS" section (MoMorph B, spec item `B`): filter dropdowns +
 * a bounded 3-up carousel — previous/next card faded on the sides, current
 * card prominent in the center — with prev/next arrows and "n/5" pagination.
 * Filtering only marks a chosen option active and resets to slide 1 (spec
 * B.1's documented behavior); the mock list itself doesn't vary per filter.
 */
export default function HighlightCarousel({
  subtitle,
  title,
  hashtagLabel,
  departmentLabel,
  prevAriaLabel,
  nextAriaLabel,
  viewDetailLabel,
  likeAriaLabel,
  unlikeAriaLabel,
  copyLinkLabel,
  toastMessage,
}: HighlightCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = highlightKudos.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const cardProps = {
    viewDetailLabel,
    likeAriaLabel,
    unlikeAriaLabel,
    copyLinkLabel,
    toastMessage,
  };

  return (
    <section className="flex flex-col gap-10 px-6 py-8 sm:px-9 lg:px-36">
      <div className="flex flex-col gap-4">
        <p className="text-2xl leading-8 font-bold text-white">{subtitle}</p>
        <div className="h-px w-full bg-divider" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2 className="text-4xl leading-16 font-bold tracking-[-0.25px] text-gold sm:text-[57px]">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <FilterDropdown
              label={hashtagLabel}
              options={hashtagFilterOptions}
              onSelect={() => setIndex(0)}
            />
            <FilterDropdown
              label={departmentLabel}
              options={departmentFilterOptions}
              onSelect={() => setIndex(0)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 overflow-hidden lg:gap-6">
        {!isFirst && (
          <KudosCard
            kudos={highlightKudos[index - 1]}
            className="hidden max-w-100 scale-95 opacity-40 pointer-events-none lg:flex"
            {...cardProps}
          />
        )}
        <KudosCard
          kudos={highlightKudos[index]}
          className="max-w-132"
          {...cardProps}
        />
        {!isLast && (
          <KudosCard
            kudos={highlightKudos[index + 1]}
            className="hidden max-w-100 scale-95 opacity-40 pointer-events-none lg:flex"
            {...cardProps}
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-8">
        <button
          type="button"
          disabled={isFirst}
          aria-label={prevAriaLabel}
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          className="flex h-12 w-12 items-center justify-center rounded text-white transition-colors duration-150 enabled:hover:bg-white/10 disabled:opacity-30"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>
        <span className="text-2xl leading-9 font-bold text-white/60">
          <span className="text-[45px] text-gold">{index + 1}</span>/{total}
        </span>
        <button
          type="button"
          disabled={isLast}
          aria-label={nextAriaLabel}
          onClick={() => setIndex((value) => Math.min(total - 1, value + 1))}
          className="flex h-12 w-12 items-center justify-center rounded text-white transition-colors duration-150 enabled:hover:bg-white/10 disabled:opacity-30"
        >
          <ArrowRightIcon className="h-7 w-7" />
        </button>
      </div>
    </section>
  );
}

function FilterDropdown({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 rounded border border-gold-line bg-gold/10 px-4 py-4 text-base leading-6 font-bold text-white transition-colors duration-150 hover:bg-gold/20",
          active && "border-gold text-gold",
        )}
      >
        {active ?? label}
        <ChevronDownIcon
          className={cn(
            "h-6 w-6 shrink-0 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full right-0 z-20 mt-2 flex min-w-40 flex-col gap-1 rounded border border-gold-line bg-surface p-2 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  setActive(option);
                  setOpen(false);
                  onSelect(option);
                }}
                className={cn(
                  "w-full rounded px-3 py-2 text-left text-sm font-bold text-white transition-colors duration-150 hover:bg-white/10",
                  active === option &&
                    "bg-gold/15 text-gold shadow-[0_0_8px_rgba(250,226,135,0.5)]",
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
