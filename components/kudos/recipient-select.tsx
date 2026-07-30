"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/lib/utils/cn.utils";

/** Mock Sunner directory for the "Người nhận" search — local literal per
 * project convention (no backend directory lookup in this build's scope). */
const MOCK_SUNNERS = [
  "Trần Bình Minh",
  "Nguyễn Thị Hồng",
  "Phạm Văn Đức",
  "Lê Thị Mai",
  "Đặng Quốc Huy",
  "Vũ Thị Lan",
  "Bùi Văn Nam",
  "Hoàng Thị Thu",
  "Đỗ Văn Tùng",
  "Ngô Thị Hà",
];

const NO_RESULTS_LABEL = "Không tìm thấy kết quả";

export interface RecipientSelectProps {
  label: string;
  placeholder: string;
  value: string | null;
  onChange: (name: string) => void;
  className?: string;
}

/**
 * "Người nhận*" searchable single-select (MoMorph spec B, node
 * `520:9871`): typing filters the mock Sunner list, clicking a row selects
 * it. Closes on outside click or Escape.
 */
export default function RecipientSelect({
  label,
  placeholder,
  value,
  onChange,
  className,
}: RecipientSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return MOCK_SUNNERS;
    return MOCK_SUNNERS.filter((name) => name.toLowerCase().includes(term));
  }, [query]);

  function selectName(name: string) {
    onChange(name);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-center gap-0.5">
        <span className="text-[22px] leading-7 font-bold text-ink">{label}</span>
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
            value={open ? query : (value ?? query)}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              // Escape closes only the dropdown — kept local so it doesn't
              // bubble up and also close the surrounding dialog.
              if (event.key === "Escape" && open) {
                event.stopPropagation();
                setOpen(false);
              }
            }}
            className="w-full bg-transparent text-base leading-6 font-bold tracking-[0.15px] text-ink outline-none placeholder:text-black/40"
          />
          <button
            type="button"
            aria-label={open ? "Đóng danh sách" : "Mở danh sách"}
            onClick={() => setOpen((current) => !current)}
            className="shrink-0 text-ink"
          >
            <ChevronDownIcon className={cn("h-6 w-6 transition-transform", open && "rotate-180")} />
          </button>
        </div>
        {open && (
          <ul
            id="recipient-select-listbox"
            role="listbox"
            className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gold-line bg-white shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-6 py-3 text-sm leading-5 font-bold text-black/50">{NO_RESULTS_LABEL}</li>
            ) : (
              filtered.map((name) => (
                <li key={name} role="option" aria-selected={value === name}>
                  <button
                    type="button"
                    onClick={() => selectName(name)}
                    className={cn(
                      "block w-full px-6 py-3 text-left text-base leading-6 font-bold text-ink hover:bg-gold/20",
                      value === name && "bg-gold/30",
                    )}
                  >
                    {name}
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
