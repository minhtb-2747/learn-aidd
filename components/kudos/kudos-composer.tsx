"use client";

import { PenIcon, SearchIcon } from "@/icons";
import { useKudosModals } from "./kudos-modals-provider";

export interface KudosComposerProps {
  inputPlaceholder: string;
  searchPlaceholder: string;
}

/**
 * Banner action row (A.1). The "Ô nhập/Ghi nhận" pill opens the Write-Kudos
 * dialog via the shared `KudosModalsProvider` (so the floating widget can open
 * the same instance). The Sunner-search pill stays a presentational stub.
 */
export default function KudosComposer({
  inputPlaceholder,
  searchPlaceholder,
}: KudosComposerProps) {
  const { openWrite } = useKudosModals();

  return (
    <div className="flex flex-wrap items-stretch gap-8">
      <button
        type="button"
        onClick={openWrite}
        className="flex flex-1 basis-100 items-center gap-4 rounded-full border border-gold-line bg-gold/10 px-4 py-6 text-left transition-colors duration-150 hover:bg-gold/20"
      >
        <PenIcon className="h-6 w-6 shrink-0 text-white" />
        <span className="truncate text-base leading-6 font-bold tracking-[0.15px] text-white">
          {inputPlaceholder}
        </span>
      </button>

      {/* Stub — Sunner profile search (out of scope). */}
      <button
        type="button"
        className="flex items-center gap-4 rounded-full border border-gold-line bg-gold/10 px-4 py-6 text-left transition-colors duration-150 hover:bg-gold/20"
      >
        <SearchIcon className="h-6 w-6 shrink-0 text-white" />
        <span className="truncate text-base leading-6 font-bold tracking-[0.15px] text-white">
          {searchPlaceholder}
        </span>
      </button>
    </div>
  );
}
