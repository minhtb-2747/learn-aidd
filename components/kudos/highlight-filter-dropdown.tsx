"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

export interface HighlightFilterDropdownProps {
  label: string;
  options: string[];
  /** Currently-selected option, controlled by the parent (URL-driven), or `null` for none. */
  active: string | null;
  /** Selecting the already-active option clears it (passes `null`). */
  onSelect: (option: string | null) => void;
}

/**
 * Single filter dropdown used by `HighlightCarousel`'s hashtag/department
 * filters (spec B.1.1/B.1.2). Split out of the carousel file to keep it
 * under the 200-line budget — this is a pure, stateless-selection UI piece
 * with no data fetching of its own.
 */
export default function HighlightFilterDropdown({
  label,
  options,
  active,
  onSelect,
}: HighlightFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex cursor-pointer items-center gap-1 rounded border border-gold-line bg-gold/10 px-4 py-4 text-base leading-6 font-bold text-white transition-colors duration-150 hover:bg-gold/20",
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
                  setOpen(false);
                  onSelect(active === option ? null : option);
                }}
                className={cn(
                  "w-full cursor-pointer rounded px-3 py-2 text-left text-sm font-bold text-white transition-colors duration-150 hover:bg-white/10",
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
