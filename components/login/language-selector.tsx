"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import { ChevronDownIcon, FlagEnIcon, FlagVnIcon } from "./icons";

export type Locale = "vi" | "en";

export interface LanguageSelectorProps {
  /** Currently active locale (from the NEXT_LOCALE cookie). Defaults to 'vi'. */
  current?: Locale;
}

const OPTIONS: Array<{ value: Locale; label: string; Flag: typeof FlagVnIcon }> = [
  { value: "vi", label: "VN", Flag: FlagVnIcon },
  { value: "en", label: "EN", Flag: FlagEnIcon },
];

/**
 * VN/EN language selector shown top-right of the login header.
 * Presentational for now: selection is mocked in local state; `onSelect`
 * lets a parent (phase 06) wire it to real locale switching.
 */
export default function LanguageSelector({
  current = "vi",
}: LanguageSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Locale>(current);
  const [prevCurrent, setPrevCurrent] = useState<Locale>(current);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep local selection in sync when the `current` prop changes from
  // outside (e.g. phase 06 wiring real locale state). Adjusting state
  // during render (React's recommended pattern) avoids an extra effect
  // + cascading render.
  if (current !== prevCurrent) {
    setPrevCurrent(current);
    setSelected(current);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const active = OPTIONS.find((option) => option.value === selected) ?? OPTIONS[0];

  function handleSelect(locale: Locale) {
    setOpen(false);
    if (locale === selected) return;
    setSelected(locale); // optimistic; server `current` reconciles after refresh
    startTransition(async () => {
      await setLocale(locale);
      router.refresh(); // re-render the whole tree in the new language
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-busy={isPending}
        disabled={isPending}
        className="flex items-center gap-1 rounded px-4 py-4 text-white transition-colors duration-200 hover:bg-white/10 disabled:opacity-60"
      >
        <active.Flag className="h-6 w-6 shrink-0" />
        <span className="text-base leading-6 font-bold tracking-[0.15px]">
          {active.label}
        </span>
        <ChevronDownIcon
          className={`h-6 w-6 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full right-0 z-20 mt-2 w-32 overflow-hidden rounded-lg bg-[#0B0F12] shadow-lg ring-1 ring-white/10"
        >
          {OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === selected}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-white transition-colors duration-150 hover:bg-white/10 ${
                  option.value === selected ? "bg-white/5" : ""
                }`}
              >
                <option.Flag className="h-5 w-5 shrink-0" />
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
