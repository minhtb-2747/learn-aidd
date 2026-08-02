"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/icons";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { cn } from "@/lib/utils/cn.utils";

export type SentFilterValue = "sent" | "received";

export interface SentFilterOption {
  value: SentFilterValue;
  label: string;
  count: number;
}

export interface SentFilterProps {
  options: [SentFilterOption, SentFilterOption];
  value: SentFilterValue;
  onChange: (value: SentFilterValue) => void;
  /**
   * True while a filter navigation is in flight. The overlay already blocks the
   * pointer; this takes the trigger out of the tab order too, so a second
   * filter cannot be started from the keyboard.
   */
  disabled?: boolean;
}

/**
 * "Đã gửi (5)" filter dropdown (MoMorph spec `C.3`): a button showing the
 * active option + count, opening a small menu to switch between "Đã gửi" and
 * "Đã nhận". Light client interaction only — see `ProfileKudosList` for how
 * the selected value is used.
 */
export default function SentFilter({
  options,
  value,
  onChange,
  disabled = false,
}: SentFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const active = options.find((option) => option.value === value) ?? options[0];
  // Never render an interactive list behind a blocking overlay.
  const expanded = open && !disabled;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded border border-gold-line bg-gold/10 px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-150 hover:bg-gold/20",
          disabled && "cursor-not-allowed opacity-60 hover:bg-gold/10",
        )}
      >
        {active.label} ({active.count})
        <ChevronDownIcon
          className={cn(
            "h-6 w-6 shrink-0 transition-transform duration-150",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <ul
          role="listbox"
          className="absolute top-full right-0 z-20 mt-2 min-w-full overflow-hidden rounded border border-gold-line bg-ink shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full cursor-pointer px-6 py-3 text-left text-base leading-6 font-bold whitespace-nowrap text-white transition-colors duration-150 hover:bg-white/10",
                  option.value === value && "bg-gold/10",
                )}
              >
                {option.label} ({option.count})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
