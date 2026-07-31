"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";
import { searchSunnersAction } from "@/app/actions/kudos";
import KudosAvatar from "./kudos-avatar";

const DEBOUNCE_MS = 250;

export interface RecipientOption {
  id: string;
  name: string;
  /** Shown as the option's grey sub-line. Absent on a seeded initial value. */
  department?: string;
}

/** A solid triangle, not the stroked `ChevronDownIcon` used elsewhere. */
function CaretIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 5"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 0L5 5L10 0H0Z" fill="currentColor" />
    </svg>
  );
}

export interface RecipientSelectProps {
  label: string;
  placeholder: string;
  value: RecipientOption | null;
  onChange: (value: RecipientOption) => void;
  className?: string;
}

/**
 * "Người nhận*" searchable single-select. Typing debounces into
 * `searchSunnersAction` — a server action, because a client component cannot
 * import `lib/kudos/queries/**` (they pull in `next/headers`).
 */
export default function RecipientSelect({
  label,
  placeholder,
  value,
  onChange,
  className,
}: RecipientSelectProps) {
  // Translated here, not via props: these strings describe this control's own
  // internal states, not copy the parent form decides.
  const t = useTranslations("Kudos.recipient");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<RecipientOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const options = await searchSunnersAction(query);
        setResults(
          options.map(({ id, name, department }) => ({ id, name, department })),
        );
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  function selectOption(option: RecipientOption) {
    onChange(option);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-center gap-0.5">
        <span className="text-[22px] leading-7 font-bold text-ink">
          {label}
        </span>
        <span className="text-base leading-5 font-bold text-danger">*</span>
      </div>
      <div ref={containerRef} className="relative w-full">
        <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-gold-line bg-white px-6 py-4">
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="recipient-select-listbox"
            value={open ? query : (value?.name ?? query)}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              // Kept local so Escape doesn't bubble up and close the dialog.
              if (event.key === "Escape" && open) {
                event.stopPropagation();
                setOpen(false);
              }
            }}
            className="w-full bg-transparent text-base leading-6 font-bold tracking-[0.15px] text-ink outline-none placeholder:text-black/40"
          />
          <button
            type="button"
            aria-label={open ? t("closeList") : t("openList")}
            onClick={() => setOpen((current) => !current)}
            className="shrink-0 cursor-pointer text-ink"
          >
            <CaretIcon
              className={cn(
                "h-[5px] w-[10px] transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </div>
        {open && (
          <ul
            id="recipient-select-listbox"
            role="listbox"
            className="absolute z-10 mt-2 max-h-37 w-full overflow-y-auto rounded-lg border border-gold-line bg-[#00070C] p-1.5 shadow-lg"
          >
            {isPending || results.length === 0 ? (
              <li className="px-4 py-3 text-sm leading-5 font-bold text-white/50">
                {isPending ? t("searching") : t("noResults")}
              </li>
            ) : (
              results.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={value?.id === option.id}
                >
                  <button
                    type="button"
                    onClick={() => selectOption(option)}
                    className={cn(
                      // `rounded-xs` is 2px in Tailwind v4 (the scale shifted).
                      "flex h-17 w-full cursor-pointer items-center gap-3 rounded-xs px-2.5 text-left transition-colors duration-150 hover:bg-gold/20",
                      value?.id === option.id && "bg-gold/20",
                    )}
                  >
                    <KudosAvatar
                      name={option.name}
                      size={40}
                      className="shrink-0"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-base leading-6 font-bold text-white">
                        {option.name}
                      </span>
                      {option.department && (
                        <span className="truncate text-sm leading-5 font-bold text-[#999999]">
                          {option.department}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
