"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn.utils";

interface IconProps {
  className?: string;
}

/** Small "X" glyph — chip/thumbnail remove affordance, reused across Kudos dialog fields. */
export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Small "+" glyph — "add hashtag" / "add image" affordance. */
export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" fill="currentColor" />
    </svg>
  );
}

export interface HashtagInputProps {
  label: string;
  addLabel: string;
  maxLabel: string;
  inputPlaceholder: string;
  removeAriaLabel: (tag: string) => string;
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  className?: string;
}

/**
 * "Hashtag*" field (MoMorph spec E, node `520:9890`): removable chips plus a
 * "+ Hashtag / Tối đa {max}" affordance that reveals an inline text input.
 * Enter (or blur) commits the draft as a new chip; duplicates (case
 * insensitive) and entries past `max` are silently ignored.
 */
export default function HashtagInput({
  label,
  addLabel,
  maxLabel,
  inputPlaceholder,
  removeAriaLabel,
  value,
  onChange,
  max = 5,
  className,
}: HashtagInputProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const trimmed = draft.trim().replace(/^#/, "");
    setDraft("");
    if (!trimmed || value.length >= max) return;
    if (value.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
      setAdding(false);
    } else if (event.key === "Escape") {
      // Keep Escape local to the hashtag draft — don't let it bubble up and
      // also close the surrounding Write-Kudos dialog.
      event.stopPropagation();
      setDraft("");
      setAdding(false);
    }
  }

  function handleRemove(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-center gap-0.5">
        <span className="text-[22px] leading-7 font-bold text-ink">{label}</span>
        <span className="text-base leading-5 font-bold text-danger">*</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-2 rounded-lg border border-gold-line bg-white px-2 py-1 text-base leading-6 font-bold tracking-[0.15px] text-ink"
          >
            #{tag}
            <button
              type="button"
              aria-label={removeAriaLabel(tag)}
              onClick={() => handleRemove(tag)}
              className="cursor-pointer text-black/40 transition-colors hover:text-danger"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {value.length < max &&
          (adding ? (
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                commitDraft();
                setAdding(false);
              }}
              placeholder={inputPlaceholder}
              className="w-32 rounded-lg border border-gold-line bg-white px-2 py-1.5 text-base leading-6 font-bold text-ink outline-none placeholder:text-black/40"
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-gold-line bg-white px-2 py-1.5 text-black/50 transition-colors hover:bg-gold/10"
            >
              <PlusIcon className="h-6 w-6 text-ink" />
              <span className="flex flex-col text-left text-[11px] leading-4 font-bold tracking-[0.5px]">
                <span>{addLabel}</span>
                <span>{maxLabel}</span>
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
